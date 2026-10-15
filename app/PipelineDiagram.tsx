export type PipelineStep = { name: string; detail?: string };

const WIDTH = 720;
const HEIGHT = 180;
const PAD = 8;
const GAP = 40; // room for the arrow between two boxes

// A left-to-right pipeline: one box per step, arrows in between. Colours come from CSS
// (.diagram .node, .arrow, .label, .detail) so the diagram follows the light/dark theme.
export default function PipelineDiagram({ steps, title }: { steps: PipelineStep[]; title: string }) {
  const boxWidth = (WIDTH - 2 * PAD - GAP * (steps.length - 1)) / steps.length;
  const mid = HEIGHT / 2;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${title}: ${steps.map((s) => s.name).join(", then ")}`}>
      {steps.map((step, i) => {
        const x = PAD + i * (boxWidth + GAP);
        const boxHeight = step.detail ? 80 : 60;
        return (
          <g key={`${i}-${step.name}`}>
            {i > 0 ? <line className="arrow" x1={x - GAP} y1={mid} x2={x} y2={mid} /> : null}
            <rect
              className={step.detail ? "node node-detail" : "node"}
              x={x}
              y={mid - boxHeight / 2}
              width={boxWidth}
              height={boxHeight}
              rx={6}
            />
            <text className="label" x={x + boxWidth / 2} y={step.detail ? mid - 6 : mid + 5} textAnchor="middle">
              {step.name}
            </text>
            {step.detail ? (
              <text className="detail" x={x + boxWidth / 2} y={mid + 14} textAnchor="middle">
                {step.detail}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
