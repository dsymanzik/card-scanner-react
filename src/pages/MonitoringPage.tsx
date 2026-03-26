import { useEffect } from 'react'
import { useMonitoringStore } from '../stores/monitoringStore'
import Badge from '../components/Badge'

export default function MonitoringPage() {
  const { health, healthOnline, pipeline, pipelineAvailable, fetchStatus } = useMonitoringStore()

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-6" style={{ color: '#ccc' }}>
        Monitoring
      </h1>

      {/* Pipeline section */}
      <div className="rounded mb-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
            Pipeline
          </p>

          {!pipelineAvailable ? (
            <p className="text-sm" style={{ color: '#666' }}>
              Pipeline status unavailable
            </p>
          ) : pipeline ? (
            <div className="flex flex-col gap-2">
              {/* State */}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#aaa' }}>Status</span>
                {pipeline.state === 'running' ? (
                  <Badge variant="ok">Running</Badge>
                ) : (
                  <Badge variant="default">Idle</Badge>
                )}
              </div>

              {/* Session info */}
              {pipeline.state === 'running' && pipeline.session && (
                <div className="pl-0 flex flex-col gap-1">
                  <div className="flex gap-2 text-sm">
                    <span style={{ color: '#666' }}>Box:</span>
                    <span style={{ color: '#ccc' }}>{pipeline.session.box}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span style={{ color: '#666' }}>Progress:</span>
                    <span style={{ color: '#ccc' }}>
                      {pipeline.session.submitted} / {pipeline.session.total}
                    </span>
                  </div>
                </div>
              )}

              {/* iCloud inbox */}
              <div className="flex items-center gap-2 text-sm mt-1">
                <span style={{ color: '#666' }}>iCloud inbox:</span>
                <span style={{ color: '#ccc' }}>
                  {pipeline.inbox_count} file{pipeline.inbox_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Windows API / Health section */}
      <div className="rounded mb-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
            Windows API
          </p>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs" style={{ color: '#aaa' }}>Health</span>
            {healthOnline ? (
              <Badge variant="ok">Online</Badge>
            ) : (
              <Badge variant="error">Offline</Badge>
            )}
          </div>

          {healthOnline && health && (
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex gap-4 text-sm flex-wrap">
                <span style={{ color: '#666' }}>
                  Cards:{' '}
                  <span style={{ color: '#ccc' }}>{health.card_count.toLocaleString()}</span>
                </span>
                <span style={{ color: '#666' }}>
                  Unreviewed:{' '}
                  <span style={{ color: health.unreviewed_count > 0 ? '#cc9944' : '#ccc' }}>
                    {health.unreviewed_count.toLocaleString()}
                  </span>
                </span>
                <span style={{ color: '#666' }}>
                  Disk:{' '}
                  <span style={{ color: '#ccc' }}>{health.disk_used_gb.toFixed(1)} GB</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Log section */}
      {pipelineAvailable && pipeline && pipeline.log_lines.length > 0 && (
        <div className="rounded" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#888' }}>
              Pipeline Log
            </p>
            <pre
              className="text-xs rounded p-3 overflow-x-auto"
              style={{
                background: '#111',
                color: '#aaa',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {[...pipeline.log_lines].reverse().join('\n')}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
