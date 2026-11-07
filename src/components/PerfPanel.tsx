import { lowPower, perfOn, perfSwitches, setPerf, type PerfSwitch } from '../perf.ts'

/** The ?perf panel: one checkbox per smoothness change, so any can be switched back off. */
export function PerfPanel() {
  return (
    <form
      aria-label="Smoothness switches"
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2000,
        display: 'grid',
        gap: 6,
        padding: 12,
        borderRadius: 10,
        background: 'rgb(0 0 0 / 0.85)',
        color: '#fff',
        font: '12px/1.4 system-ui, sans-serif',
      }}
    >
      <strong>Smoothness switches</strong>
      {(Object.keys(perfSwitches) as PerfSwitch[]).map((name) => (
        <label key={name} style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 28 }}>
          <input type="checkbox" checked={perfOn(name)} onChange={(event) => setPerf(name, event.target.checked)} />
          {perfSwitches[name]}
        </label>
      ))}
      <span style={{ opacity: 0.7 }}>Low-power device detected: {lowPower ? 'yes' : 'no'}</span>
    </form>
  )
}
