# Training the Models

Three training scripts under `ml/training/`. Each saves artifacts to `ml/models/<name>/saved/`. The runtime predictors auto-load whatever's there — if `saved/` doesn't exist they fall back to the rule-based stub, so you can train one model at a time without breaking the pipeline.

## Quickest path — Google Colab (~7–10 min total)

1. Open https://colab.research.google.com → New notebook → Runtime → Change runtime → **T4 GPU**.

2. **Mount your repo** (whichever way is easiest — paste this for a quick GitHub-less workflow, otherwise upload `ml/` as a zip):

   ```python
   !git clone https://github.com/<you>/bridgix.git
   %cd bridgix/ml
   ```

   …or if you don't have it on GitHub:

   ```python
   from google.colab import files
   files.upload()                     # upload ml.zip
   !unzip -q ml.zip -d .
   %cd ml
   ```

3. **Install training deps** (one cell):

   ```python
   !pip install -q -r requirements-train.txt
   !pip install -q torch_geometric    # only needed for the GraphSAGE script
   ```

4. **Train all three** (one cell each so you can see progress):

   ```python
   !python training/train_xgboost.py    --output_dir models/xgboost/saved   #  ~30 sec
   !python training/train_bert.py       --output_dir models/bert/saved      #  ~5 min on T4
   !python training/train_graphsage.py  --output_dir models/graphsage/saved #  ~1 min on T4
   ```

5. **Zip the artifacts and download**:

   ```python
   !zip -qr saved_models.zip models/bert/saved models/graphsage/saved models/xgboost/saved
   from google.colab import files; files.download('saved_models.zip')
   ```

6. Locally, unzip into the repo so the structure is:
   ```
   ml/models/bert/saved/         (config.json, model.safetensors, tokenizer files, training_metrics.json)
   ml/models/graphsage/saved/    (model.pt, training_metrics.json)
   ml/models/xgboost/saved/      (xgb.json, feature_names.json, training_metrics.json)
   ```

7. Restart `python main.py`. You should see:
   ```
   [bert] loaded fine-tuned model from .../models/bert/saved
   [xgb] loaded trained model from .../models/xgboost/saved/xgb.json
   [gs]  loaded trained model from .../models/graphsage/saved/model.pt
   ```

## Datasets

| Model      | Dataset                                                | Source                       |
| ---------- | ------------------------------------------------------ | ---------------------------- |
| BERT       | SMS Spam Collection (5.5k labelled SMS)                | HuggingFace `sms_spam`       |
| XGBoost    | SMS Spam Collection — text-derived behavioral features | same                         |
| GraphSAGE  | Synthetic alumni–student style graph (~1500 nodes)     | generated in script          |

GraphSAGE is the weak link of the three because we don't yet have a real interaction graph from production. The synthetic graph encodes the structural patterns the report describes (high out-degree spammers, dense spam-spam edges, asymmetric connection ratios) and produces a real loadable checkpoint. Replace with the real graph once Bridgix has enough users — the runtime contract doesn't change.

## Hyperparameters (defaults match `ml/.env.example` / report Table 6.3–6.5)

| Model      | Setting                                                          |
| ---------- | ---------------------------------------------------------------- |
| BERT       | `bert-base-uncased`, lr 2e-5, batch 32, 1 epoch, max_len 128     |
| XGBoost    | 200 trees, max_depth 6, lr 0.1                                   |
| GraphSAGE  | 2 SAGEConv layers, hidden 32, lr 1e-3, 50 epochs                 |

All accept `--epochs`, `--lr`, etc. as CLI flags. Random seed is fixed at `45` for reproducibility (matches the report).

## Where the metrics go

Each script writes `training_metrics.json` next to the model. The Results chapter of the report can be regenerated from these three files (accuracy / precision / recall / F1 / AUC / confusion matrix per model).
