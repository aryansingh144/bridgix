"""Fine-tune bert-base-uncased on the SMS Spam Collection.

Designed for Colab T4 / CPU. ~4–6 minutes on T4 GPU for 1 epoch.

Usage (Colab):
    !pip install -q -r requirements-train.txt
    !python training/train_bert.py --output_dir models/bert/saved

Then download the resulting `models/bert/saved/` folder and drop it into the
same path on your local repo. The runtime BertPredictor auto-loads it.
"""

from __future__ import annotations
import argparse
import json
import os

import numpy as np
import torch
from datasets import load_dataset
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    roc_auc_score,
    confusion_matrix,
)
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--model_name", default="bert-base-uncased")
    p.add_argument("--output_dir", default="models/bert/saved")
    p.add_argument("--epochs", type=int, default=1)
    p.add_argument("--batch_size", type=int, default=32)
    p.add_argument("--lr", type=float, default=2e-5)
    p.add_argument("--max_len", type=int, default=128)
    p.add_argument("--seed", type=int, default=45)
    return p.parse_args()


def compute_metrics(pred):
    logits, labels = pred
    probs = torch.softmax(torch.tensor(logits), dim=-1).numpy()
    preds = probs.argmax(axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="binary", zero_division=0
    )
    acc = accuracy_score(labels, preds)
    try:
        auc = roc_auc_score(labels, probs[:, 1])
    except ValueError:
        auc = float("nan")
    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1, "auc": auc}


def main() -> None:
    args = parse_args()
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    print(f"[bert] loading dataset 'sms_spam'")
    raw = load_dataset("sms_spam")["train"]
    raw = raw.rename_columns({"sms": "text", "label": "labels"})
    split = raw.train_test_split(test_size=0.2, seed=args.seed, stratify_by_column="labels")
    train_ds, test_ds = split["train"], split["test"]
    print(f"[bert] train={len(train_ds)} test={len(test_ds)}")

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    def tok(batch):
        return tokenizer(batch["text"], truncation=True, max_length=args.max_len)

    train_ds = train_ds.map(tok, batched=True, remove_columns=["text"])
    test_ds = test_ds.map(tok, batched=True, remove_columns=["text"])

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=2,
        id2label={0: "ham", 1: "spam"},
        label2id={"ham": 0, "spam": 1},
    )

    training_args = TrainingArguments(
        output_dir="bert_run",
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        learning_rate=args.lr,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="no",
        logging_steps=50,
        report_to="none",
        seed=args.seed,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer),
        compute_metrics=compute_metrics,
    )

    print("[bert] training…")
    trainer.train()

    print("[bert] evaluating…")
    metrics = trainer.evaluate()
    preds_out = trainer.predict(test_ds)
    cm = confusion_matrix(preds_out.label_ids, preds_out.predictions.argmax(-1)).tolist()

    os.makedirs(args.output_dir, exist_ok=True)
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    with open(os.path.join(args.output_dir, "training_metrics.json"), "w") as f:
        json.dump(
            {k: float(v) if isinstance(v, (int, float, np.floating)) else v for k, v in metrics.items()}
            | {"confusion_matrix": cm},
            f,
            indent=2,
        )

    print("[bert] saved to", args.output_dir)
    print("[bert] metrics:", metrics)
    print("[bert] confusion matrix:", cm)


if __name__ == "__main__":
    main()
