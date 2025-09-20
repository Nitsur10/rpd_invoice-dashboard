"""Generate a Plotly-based snapshot of orchestrator agent progress.

This script reads the persisted orchestrator state (data/orchestrator-state.json)
produced by the workflow registry and renders a visual dashboard summarising
per-feature agent progress, handoffs, and quality gates. It outputs both an
interactive window (if available) and static PNG/SVG files for documentation.

Usage:
    python scripts/workflow_dashboard.py

Dependencies:
    pip install plotly pandas kaleido
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

import plotly.graph_objects as go

STATE_PATH = Path("data/orchestrator-state.json")
PNG_OUTPUT = Path("docs/visuals/workflow_dashboard.png")
SVG_OUTPUT = Path("docs/visuals/workflow_dashboard.svg")
HTML_OUTPUT = Path("docs/visuals/workflow_dashboard.html")

# Ensure output directory exists
PNG_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

# Colours for the different agent groupings and statuses.
AGENT_COLORS = {
    "Foundation": "#1FB8CD",  # Strong cyan
    "Development": "#2E8B57",  # Sea green
    "Quality": "#D2BA4C",  # Yellow-orange
    "Deployment": "#DB4545",  # Bright red
    "Cross-cutting": "#944454",  # Pink-red
}

STATUS_COLORS = {
    "Active": "#2E8B57",
    "Complete": "#1FB8CD",
    "Queued": "#5D878F",
    "Waiting": "#D2BA4C",
    "Error": "#DB4545",
}

# Fallback scaffolding if no persisted state exists yet.
FALLBACK_DATA: Dict[str, Any] = {
    "features": [
        {
            "id": "FT-000",
            "title": "Sample Feature",
            "status": "Planning",
            "agents": [
                {
                    "name": "Design System Agent",
                    "task": "Define colours & typography",
                    "status": "Queued",
                    "progress": 0,
                },
                {
                    "name": "Schema Architect Agent",
                    "task": "Draft schema",
                    "status": "Queued",
                    "progress": 0,
                },
            ],
        }
    ]
}


def load_state() -> Dict[str, Any]:
    """Load orchestrator state from disk or fall back to demo data."""
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text())
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                f"Failed to parse orchestrator state at {STATE_PATH!s}."
            ) from exc
    return FALLBACK_DATA


def normalise_features(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Transform orchestrator workflows into the plotting schema."""
    workflows = state.get("workflows")
    if workflows:
        features = []
        for workflow in workflows:
            agents = []
            for agent in workflow.get("agents", []):
                outputs = agent.get("outputs") or []
                agents.append(
                    {
                        "name": agent.get("name", agent.get("id", "Agent")),
                        "task": ", ".join(outputs) if outputs else "Pending task",
                        "status": agent.get("status", "Queued"),
                        "progress": agent.get("progress", 0),
                    }
                )
            features.append(
                {
                    "id": workflow.get("id", "FT-XXX"),
                    "title": workflow.get("title", "Unnamed Feature"),
                    "status": workflow.get("status", "Planning"),
                    "agents": agents,
                }
            )
        return features

    # Fallback path (no orchestrator data yet)
    return state.get("features", [])


def agent_category(agent_name: str) -> str:
    """Heuristic mapping of agent names to lifecycle category."""
    lowered = agent_name.lower()
    if any(keyword in lowered for keyword in ("baseline", "schema", "foundation")):
        return "Foundation"
    if any(keyword in lowered for keyword in ("design", "component", "feature", "api")):
        return "Development"
    if any(keyword in lowered for keyword in ("test", "quality")):
        return "Quality"
    if any(keyword in lowered for keyword in ("deploy", "release")):
        return "Deployment"
    if any(keyword in lowered for keyword in ("doc", "observ", "perf", "security")):
        return "Cross-cutting"
    return "Development"


def build_figure(data: Dict[str, Any]) -> go.Figure:
    fig = go.Figure()
    y_pos = 0
    feature_positions = {}

    features = data.get("features", [])

    for feature in features:
        feature_id = feature.get("id", "FT-XXX")
        feature_positions[feature_id] = y_pos

        # Feature header
        fig.add_shape(
            type="rect",
            x0=0,
            x1=120,
            y0=y_pos - 0.4,
            y1=y_pos + 0.4,
            fillcolor="#13343B",
            line=dict(color="white", width=1),
        )
        fig.add_annotation(
            x=60,
            y=y_pos,
            text=f"<b>{feature_id}</b> {feature.get('title', '')}",
            showarrow=False,
            font=dict(color="white", size=14),
            xanchor="center",
        )
        y_pos -= 1

        # Agent rows
        for agent in feature.get("agents", []):
            name = agent.get("name", "Agent")
            category = agent_category(name)
            progress = agent.get("progress", 0)
            status = agent.get("status", "Queued")
            status_colour = STATUS_COLORS.get(status, "#5D878F")

            fig.add_shape(
                type="rect",
                x0=10,
                x1=110,
                y0=y_pos - 0.3,
                y1=y_pos + 0.3,
                fillcolor=AGENT_COLORS.get(category, "#5D878F"),
                opacity=0.3,
                line=dict(color=AGENT_COLORS.get(category, "#5D878F"), width=2),
            )
            if progress:
                fig.add_shape(
                    type="rect",
                    x0=70,
                    x1=70 + progress * 0.35,
                    y0=y_pos - 0.2,
                    y1=y_pos + 0.2,
                    fillcolor=status_colour,
                    line=dict(color=status_colour, width=1),
                )

            fig.add_annotation(
                x=15,
                y=y_pos,
                text=(
                    f"<b>{name}</b><br>{agent.get('task', 'No task defined')}<br>"
                    f"Status: {status}"
                ),
                showarrow=False,
                font=dict(size=10),
                xanchor="left",
                align="left",
            )
            fig.add_annotation(
                x=105,
                y=y_pos,
                text=f"{progress}%",
                showarrow=False,
                font=dict(size=10, color=status_colour),
                xanchor="right",
            )
            y_pos -= 0.8

        y_pos -= 0.5

    # Legend entries
    for category, colour in AGENT_COLORS.items():
        fig.add_trace(
            go.Scatter(
                x=[None],
                y=[None],
                mode="markers",
                marker=dict(size=10, color=colour),
                name=category,
                showlegend=True,
            )
        )
    for status, colour in STATUS_COLORS.items():
        fig.add_trace(
            go.Scatter(
                x=[None],
                y=[None],
                mode="markers",
                marker=dict(size=8, color=colour, symbol="square"),
                name=f"Status: {status}",
                showlegend=True,
            )
        )

    fig.update_layout(
        title="Agent Workflow Dashboard",
        xaxis=dict(range=[0, 180], showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(range=[y_pos - 1, 1], showgrid=False, showticklabels=False, zeroline=False),
        plot_bgcolor="white",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
    )
    fig.update_traces(cliponaxis=False)
    return fig


def main() -> None:
    state = load_state()
    data = {"features": normalise_features(state)}
    fig = build_figure(data)

    # Persist static artefacts (fall back to HTML if image export fails)
    try:
        fig.write_image(str(PNG_OUTPUT))
        fig.write_image(str(SVG_OUTPUT))
    except Exception as exc:  # noqa: BLE001 - logging fallback for headless environments
        print(f"[workflow_dashboard] Image export failed: {exc}")
        print(
            "[workflow_dashboard] Falling back to HTML export; "
            f"writing {HTML_OUTPUT}"
        )
        fig.write_html(str(HTML_OUTPUT))

    # Show interactive figure if possible
    try:
        fig.show()
    except Exception as exc:  # noqa: BLE001 - headless environments may block this
        print(f"[workflow_dashboard] Display not available: {exc}")


if __name__ == "__main__":
    main()
