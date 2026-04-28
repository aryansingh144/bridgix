"""Train GraphSAGE on a synthetic spam-network graph.

The Twitter Bot dataset and a real Bridgix interaction graph aren't yet
available, so this script generates a synthetic alumni–student style network
where ~12% of users are spammers. Spammers exhibit higher out-degree, more
links among themselves, and more connections to other spammers — the exact
patterns GraphSAGE is meant to surface.

This is a scaffolding model: it learns the structural patterns the report
describes and produces a real, loadable checkpoint. Replace with the actual
interaction graph once production data exists; the inference contract stays
the same.

Usage (Colab, ~1–2 min on T4):
    !pip install -q torch_geometric
    !python training/train_graphsage.py --output_dir models/graphsage/saved
"""

from __future__ import annotations
import argparse
import json
import os

import numpy as np
import torch
import torch.nn.functional as F
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
    roc_auc_score,
)


def generate_synthetic_graph(n_users: int = 1500, spam_ratio: float = 0.12, seed: int = 45):
    rng = np.random.default_rng(seed)
    n_spam = int(n_users * spam_ratio)
    is_spam = np.zeros(n_users, dtype=np.int64)
    is_spam[:n_spam] = 1
    rng.shuffle(is_spam)

    src, dst = [], []
    for u in range(n_users):
        if is_spam[u]:
            # spammers: high out-degree, biased toward other spammers + random ham
            out_deg = int(rng.normal(40, 10))
            spam_neighbors = rng.choice(np.where(is_spam == 1)[0], size=max(out_deg // 2, 1))
            ham_neighbors = rng.choice(np.where(is_spam == 0)[0], size=max(out_deg // 2, 1))
            for v in np.concatenate([spam_neighbors, ham_neighbors]):
                if v != u:
                    src.append(u)
                    dst.append(int(v))
        else:
            # ham: moderate, mostly to other ham
            out_deg = max(1, int(rng.normal(8, 3)))
            neighbors = rng.choice(np.where(is_spam == 0)[0], size=out_deg)
            for v in neighbors:
                if v != u:
                    src.append(u)
                    dst.append(int(v))

    edge_index = np.array([src, dst], dtype=np.int64)

    # Per-node features: out-degree, in-degree, asymmetry, neighbor-spam rate (proxy)
    out_deg = np.zeros(n_users)
    in_deg = np.zeros(n_users)
    for s, d in zip(src, dst):
        out_deg[s] += 1
        in_deg[d] += 1
    asymmetry = (out_deg - in_deg) / (out_deg + in_deg + 1)
    new_conns = rng.poisson(lam=np.where(is_spam == 1, 30, 3))

    x = np.stack(
        [
            np.log1p(out_deg),
            np.log1p(in_deg),
            asymmetry,
            new_conns / 50.0,
        ],
        axis=1,
    ).astype(np.float32)

    return x, edge_index, is_spam


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--output_dir", default="models/graphsage/saved")
    p.add_argument("--n_users", type=int, default=1500)
    p.add_argument("--epochs", type=int, default=50)
    p.add_argument("--hidden", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--seed", type=int, default=45)
    return p.parse_args()


def main() -> None:
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    try:
        from torch_geometric.data import Data
        from torch_geometric.nn import SAGEConv
    except ImportError as e:
        raise SystemExit(
            "torch_geometric not installed. On Colab run:\n"
            "  !pip install -q torch_geometric"
        ) from e

    print(f"[gs] generating synthetic graph (n={args.n_users})")
    x_np, edge_np, y_np = generate_synthetic_graph(args.n_users, seed=args.seed)
    x = torch.tensor(x_np, dtype=torch.float)
    edge_index = torch.tensor(edge_np, dtype=torch.long)
    y = torch.tensor(y_np, dtype=torch.long)
    data = Data(x=x, edge_index=edge_index, y=y)

    n = data.num_nodes
    perm = torch.randperm(n)
    n_train = int(0.7 * n)
    n_val = int(0.1 * n)
    train_mask = torch.zeros(n, dtype=torch.bool); train_mask[perm[:n_train]] = True
    val_mask   = torch.zeros(n, dtype=torch.bool); val_mask[perm[n_train:n_train+n_val]] = True
    test_mask  = torch.zeros(n, dtype=torch.bool); test_mask[perm[n_train+n_val:]] = True

    class SAGE(torch.nn.Module):
        def __init__(self, in_dim, hid, out_dim):
            super().__init__()
            self.c1 = SAGEConv(in_dim, hid)
            self.c2 = SAGEConv(hid, out_dim)

        def forward(self, x, edge_index):
            h = F.relu(self.c1(x, edge_index))
            return self.c2(h, edge_index)

    model = SAGE(data.num_node_features, args.hidden, 2)
    optim = torch.optim.Adam(model.parameters(), lr=args.lr, weight_decay=5e-4)

    print("[gs] training")
    for epoch in range(1, args.epochs + 1):
        model.train()
        optim.zero_grad()
        logits = model(data.x, data.edge_index)
        loss = F.cross_entropy(logits[train_mask], data.y[train_mask])
        loss.backward()
        optim.step()
        if epoch % 10 == 0:
            model.eval()
            with torch.no_grad():
                preds = logits.argmax(-1)
                tr = (preds[train_mask] == data.y[train_mask]).float().mean().item()
                val = (preds[val_mask] == data.y[val_mask]).float().mean().item()
            print(f"[gs] epoch {epoch:3d} loss={loss.item():.4f} train_acc={tr:.4f} val_acc={val:.4f}")

    # Test
    model.eval()
    with torch.no_grad():
        logits = model(data.x, data.edge_index)
        probs = F.softmax(logits, dim=-1)[:, 1].cpu().numpy()
        preds = logits.argmax(-1).cpu().numpy()
    y_true = data.y.cpu().numpy()
    test_idx = test_mask.cpu().numpy()
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true[test_idx], preds[test_idx], average="binary", zero_division=0
    )
    acc = accuracy_score(y_true[test_idx], preds[test_idx])
    auc = roc_auc_score(y_true[test_idx], probs[test_idx])
    cm = confusion_matrix(y_true[test_idx], preds[test_idx]).tolist()

    os.makedirs(args.output_dir, exist_ok=True)
    torch.save(
        {
            "state_dict": model.state_dict(),
            "config": {
                "in_dim": data.num_node_features,
                "hidden": args.hidden,
                "out_dim": 2,
            },
        },
        os.path.join(args.output_dir, "model.pt"),
    )
    with open(os.path.join(args.output_dir, "training_metrics.json"), "w") as f:
        json.dump(
            {
                "accuracy": acc,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "auc": auc,
                "confusion_matrix": cm,
                "synthetic_graph": True,
                "n_users": args.n_users,
            },
            f,
            indent=2,
        )

    print("[gs] saved to", args.output_dir)
    print(f"[gs] accuracy={acc:.4f} precision={precision:.4f} recall={recall:.4f} f1={f1:.4f} auc={auc:.4f}")


if __name__ == "__main__":
    main()
