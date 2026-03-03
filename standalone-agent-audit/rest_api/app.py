from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel

# 复用 pip package 中的核心逻辑
ROOT = Path(__file__).resolve().parents[1]
PIP_SRC = ROOT / "pip_package"
if str(PIP_SRC) not in sys.path:
    sys.path.append(str(PIP_SRC))

from agent_audit_cli.core import run_audit, to_markdown  # noqa: E402


class AuditRequest(BaseModel):
    config: str
    memory: str
    logs: str
    return_markdown: bool = False


app = FastAPI(title="Agent Audit API")


@app.post("/run")
def run_audit_endpoint(payload: AuditRequest) -> dict[str, Any]:
    report = run_audit(Path(payload.config), Path(payload.memory), Path(payload.logs))
    response = {"report": report}
    if payload.return_markdown:
        response["markdown"] = to_markdown(report)
    return response
