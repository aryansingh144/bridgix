"""GraphSAGE predictor — relational / network spam signal.

Loads a trained GraphSAGE node classifier from `models/graphsage/saved/model.pt`
when present. The trained model expects a 4-dim node feature vector and
returns P(spam) for that node. We construct the feature vector from the
GraphFeatures input.

Falls back to a rule-based stub if no trained model is available, or if no
graph features are supplied at inference time.
"""

from __future__ import annotations
import os
import logging
from typing import Optional

from schemas import ComponentScore, GraphFeatures

log = logging.getLogger("graphsage_predictor")

SAVED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved")
MODEL_PATH = os.path.join(SAVED_DIR, "model.pt")


def _build_feature_vector(g: GraphFeatures) -> list[float]:
    import math

    out_deg = max(g.out_degree, 0)
    in_deg = max(g.in_degree, 0)
    asymmetry = (out_deg - in_deg) / (out_deg + in_deg + 1)
    return [
        math.log1p(out_deg),
        math.log1p(in_deg),
        asymmetry,
        g.new_connections_last_day / 50.0,
    ]


class GraphSagePredictor:
    name = "graphsage"

    def __init__(self) -> None:
        self.model = None
        self.ready = False

        if os.path.exists(MODEL_PATH):
            try:
                import torch  # noqa: F401
                import torch.nn.functional as F  # noqa: F401
                from torch_geometric.nn import SAGEConv  # noqa: F401

                self._load_model()
                self.ready = True
                print(f"[gs] loaded trained model from {MODEL_PATH}")
            except ImportError:
                print("[gs] torch_geometric not installed at runtime; using stub")
            except Exception as e:  # pragma: no cover
                log.warning("Failed to load GraphSAGE model: %s", e)
                print(f"[gs] load failed ({e}); using rule-based stub")
        else:
            print(f"[gs] no trained model at {MODEL_PATH}; using rule-based stub")

    def _load_model(self) -> None:
        import torch
        import torch.nn.functional as F
        from torch_geometric.nn import SAGEConv

        ckpt = torch.load(MODEL_PATH, map_location="cpu")
        cfg = ckpt["config"]

        class SAGE(torch.nn.Module):
            def __init__(self, in_dim: int, hid: int, out_dim: int) -> None:
                super().__init__()
                self.c1 = SAGEConv(in_dim, hid)
                self.c2 = SAGEConv(hid, out_dim)

            def forward(self, x, edge_index):
                h = F.relu(self.c1(x, edge_index))
                return self.c2(h, edge_index)

        self.model = SAGE(cfg["in_dim"], cfg["hidden"], cfg["out_dim"])
        self.model.load_state_dict(ckpt["state_dict"])
        self.model.eval()
        self._cfg = cfg

    # ── Inference ───────────────────────────────────────────────────────────
    def predict(self, graph: Optional[GraphFeatures]) -> ComponentScore:
        if graph is None:
            return ComponentScore(score=0.0)
        if self.ready:
            return self._predict_trained(graph)
        return self._predict_stub(graph)

    def _predict_trained(self, graph: GraphFeatures) -> ComponentScore:
        import torch
        import torch.nn.functional as F

        x = torch.tensor([_build_feature_vector(graph)], dtype=torch.float)
        # Self-loop only — single-node inference. The trained model still
        # uses its node-feature-conditioned weights to score this node.
        edge_index = torch.tensor([[0], [0]], dtype=torch.long)
        with torch.no_grad():
            logits = self.model(x, edge_index)
            prob = float(F.softmax(logits, dim=-1)[0, 1].item())

        reasons: list[str] = []
        if graph.suspicious_neighbor_ratio > 0.3:
            reasons.append("connected to flagged users")
        if graph.new_connections_last_day > 25:
            reasons.append("rapid new connections")
        if graph.out_degree > 50 and graph.in_degree < 5:
            reasons.append("highly asymmetric connection pattern")
        if prob >= 0.6:
            reasons.append("graphsage: relational pattern matches spam network")
        return ComponentScore(score=prob, reasons=reasons)

    def _predict_stub(self, graph: GraphFeatures) -> ComponentScore:
        score = 0.0
        reasons: list[str] = []
        if graph.suspicious_neighbor_ratio > 0.3:
            score += 0.4 * graph.suspicious_neighbor_ratio
            reasons.append("connected to flagged users")
        if graph.new_connections_last_day > 25:
            score += 0.3
            reasons.append("rapid new connections")
        if graph.out_degree > 50 and graph.in_degree < 5:
            score += 0.3
            reasons.append("highly asymmetric connection pattern")
        return ComponentScore(score=min(score, 1.0), reasons=reasons)
