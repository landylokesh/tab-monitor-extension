import React, { useEffect, useState, useCallback } from 'react'

const App = () => {
  console.log('🔄 App component rendering...')

  const [tabs, setTabs] = useState([])
  const [windows, setWindows] = useState([])
  const [isExtension, setIsExtension] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [groupByWindows, setGroupByWindows] = useState(true)
  const [collapsedWindows, setCollapsedWindows] = useState(new Set())

  // Note: Helper functions moved inline to collectTabData to prevent dependency issues

  // Enhanced tab data collection with better error handling
  const collectTabData = useCallback(async () => {
    console.log('Starting tab data collection...')

    try {
      setLoading(true)
      setError(null)

      console.log('Fetching windows data...')
      // Get all windows first with timeout
      const windowsData = await Promise.race([
        new Promise((resolve, reject) => {
          if (!chrome.windows || !chrome.windows.getAll) {
            reject(new Error('chrome.windows.getAll is not available'))
            return
          }

          chrome.windows.getAll({ populate: true }, (windows) => {
            if (chrome.runtime.lastError) {
              console.error('Windows API error:', chrome.runtime.lastError)
              reject(new Error(chrome.runtime.lastError.message || 'Windows API failed'))
            } else {
              console.log('Windows data received:', windows?.length || 0, 'windows')
              resolve(windows || [])
            }
          })
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Windows API timeout after 10 seconds')), 10000)
        )
      ])

      console.log('Fetching tabs data...')
      // Get all tabs with enhanced data and timeout
      const tabsData = await Promise.race([
        new Promise((resolve, reject) => {
          if (!chrome.tabs || !chrome.tabs.query) {
            reject(new Error('chrome.tabs.query is not available'))
            return
          }

          chrome.tabs.query({}, (tabs) => {
            if (chrome.runtime.lastError) {
              console.error('Tabs API error:', chrome.runtime.lastError)
              reject(new Error(chrome.runtime.lastError.message || 'Tabs API failed'))
            } else {
              console.log('Tabs data received:', tabs?.length || 0, 'tabs')
              resolve(tabs || [])
            }
          })
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tabs API timeout after 10 seconds')), 10000)
        )
      ])

      console.log('Processing tab data...')
      // Enhance tabs with additional calculated data
      const enhancedTabs = tabsData.map((tab, index) => {
        try {
          // Helper functions called directly to avoid dependency issues
          const formatTime = (timestamp) => {
            if (!timestamp) return 'Unknown'
            const now = Date.now()
            const diff = now - timestamp
            const minutes = Math.floor(diff / (1000 * 60))
            const hours = Math.floor(minutes / 60)
            const days = Math.floor(hours / 24)

            if (days > 0) return `${days}d ${hours % 24}h ago`
            if (hours > 0) return `${hours}h ${minutes % 60}m ago`
            if (minutes > 0) return `${minutes}m ago`
            return 'Just now'
          }

          const getDomain = (url) => {
            if (!url) return 'Unknown'
            try {
              if (url.startsWith('chrome://')) return 'Chrome'
              if (url.startsWith('chrome-extension://')) return 'Extension'
              if (url.startsWith('edge://')) return 'Edge'
              if (url.startsWith('about:')) return 'Browser'
              if (url.startsWith('file://')) return 'Local File'
              if (url.startsWith('data:')) return 'Data URL'

              const urlObj = new URL(url)
              return urlObj.hostname || 'Unknown'
            } catch (error) {
              console.warn('Failed to parse URL:', url, error)
              return 'Invalid URL'
            }
          }

          return {
            ...tab,
            // Calculate idle time (time since last accessed)
            idleTime: tab.lastAccessed ? Date.now() - tab.lastAccessed : null,
            idleTimeFormatted: formatTime(tab.lastAccessed),
            // Add domain extraction with error handling
            domain: getDomain(tab.url),
            // Add loading state info
            isLoading: tab.status === 'loading',
            isComplete: tab.status === 'complete',
            // Add audio state
            hasAudio: tab.audible || false,
            isMuted: tab.mutedInfo?.muted || false,
            // Add grouping info
            isGrouped: tab.groupId && tab.groupId !== -1,
            // Add window association
            windowTitle: windowsData.find(w => w.id === tab.windowId)?.type || 'normal'
          }
        } catch (tabError) {
          console.error(`Error processing tab ${index}:`, tabError, tab)
          // Return a safe fallback for this tab
          return {
            ...tab,
            domain: 'Error',
            idleTimeFormatted: 'Unknown',
            isLoading: false,
            isComplete: true,
            hasAudio: false,
            isMuted: false,
            isGrouped: false,
            windowTitle: 'normal'
          }
        }
      })

      console.log('Setting state with processed data...')
      setTabs(enhancedTabs)
      setWindows(windowsData)
      console.log('Tab data collection completed successfully')

    } catch (err) {
      const errorMessage = err.message || 'Failed to load tab data'
      console.error('Error collecting tab data:', err)
      setError(errorMessage)

      // Set empty data on error
      setTabs([])
      setWindows([])
    } finally {
      setLoading(false)
      console.log('Tab data collection finished (loading state cleared)')
    }
  }, []) // No dependencies to prevent infinite loops

  // Single useEffect for initialization - runs only once
  useEffect(() => {
    console.log('🚀 App initialization useEffect running...')

    // Check if we're running in a Chrome extension context
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.windows) {
      console.log('✅ Chrome extension context detected')
      setIsExtension(true)

      // Collect data immediately
      setTimeout(() => {
        console.log('📊 Calling collectTabData...')
        collectTabData().catch(err => {
          console.error('❌ Failed to collect tab data:', err)
          setError('Failed to initialize tab data: ' + err.message)
          setLoading(false)
        })
      }, 100)
    } else {
      console.log('🔧 Development mode - using mock data')
      setIsExtension(false)

      // Enhanced mock data for development
      const mockTabs = [
        {
          id: 1,
          title: 'Example Tab 1 - A very long title that might wrap to multiple lines',
          url: 'https://example.com/some/long/path',
          favIconUrl: 'https://example.com/favicon.ico',
          active: true,
          pinned: false,
          audible: false,
          muted: false,
          status: 'complete',
          windowId: 1,
          index: 0,
          lastAccessed: Date.now() - 300000, // 5 minutes ago
          domain: 'example.com',
          idleTimeFormatted: '5m ago',
          isLoading: false,
          isComplete: true,
          hasAudio: false,
          isMuted: false,
          isGrouped: false,
          windowTitle: 'normal'
        },
        {
          id: 2,
          title: 'Google Search Results',
          url: 'https://google.com/search?q=chrome+extension',
          favIconUrl: 'https://google.com/favicon.ico',
          active: false,
          pinned: true,
          audible: true,
          muted: false,
          status: 'complete',
          windowId: 1,
          index: 1,
          lastAccessed: Date.now() - 1800000, // 30 minutes ago
          domain: 'google.com',
          idleTimeFormatted: '30m ago',
          isLoading: false,
          isComplete: true,
          hasAudio: true,
          isMuted: false,
          isGrouped: false,
          windowTitle: 'normal'
        },
        {
          id: 3,
          title: 'GitHub Repository',
          url: 'https://github.com/user/repo',
          favIconUrl: 'https://github.com/favicon.ico',
          active: false,
          pinned: false,
          audible: false,
          muted: true,
          status: 'loading',
          windowId: 2,
          index: 0,
          lastAccessed: Date.now() - 7200000, // 2 hours ago
          domain: 'github.com',
          idleTimeFormatted: '2h ago',
          isLoading: true,
          isComplete: false,
          hasAudio: false,
          isMuted: true,
          isGrouped: true,
          windowTitle: 'normal'
        }
      ]
      setTabs(mockTabs)
      setWindows([
        { id: 1, type: 'normal', focused: true, tabs: mockTabs.slice(0, 2) },
        { id: 2, type: 'normal', focused: false, tabs: mockTabs.slice(2) }
      ])
      setLoading(false)
    }

    // Cleanup function to track component unmounting
    return () => {
      console.log('🧹 App component cleanup - useEffect unmounting')
    }
  }, []) // Run only once on mount - no dependencies to prevent infinite loops

  const handleGoToTab = (tabId) => {
    if (isExtension) {
      chrome.tabs.update(tabId, { active: true })
    } else {
      alert(`Would navigate to tab ${tabId} (Chrome extension context required)`)
    }
  }

  const handleCloseTab = (tabId) => {
    if (isExtension) {
      chrome.tabs.remove(tabId)
      setTabs(tabs.filter(tab => tab.id !== tabId))
    } else {
      alert(`Would close tab ${tabId} (Chrome extension context required)`)
      setTabs(tabs.filter(tab => tab.id !== tabId))
    }
  }

  // Window management functions
  const toggleWindowCollapse = (windowId) => {
    setCollapsedWindows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(windowId)) {
        newSet.delete(windowId)
      } else {
        newSet.add(windowId)
      }
      return newSet
    })
  }

  const getWindowTitle = (window) => {
    if (window.type === 'popup') return 'Popup Window'
    if (window.type === 'devtools') return 'DevTools Window'
    if (window.incognito) return 'Incognito Window'
    return window.focused ? 'Main Window (Active)' : 'Window'
  }

  const groupTabsByWindows = () => {
    const windowGroups = {}

    // Group tabs by window
    tabs.forEach(tab => {
      if (!windowGroups[tab.windowId]) {
        const window = windows.find(w => w.id === tab.windowId) || {
          id: tab.windowId,
          type: 'normal',
          focused: false
        }
        windowGroups[tab.windowId] = {
          window,
          tabs: []
        }
      }
      windowGroups[tab.windowId].tabs.push(tab)
    })

    // Sort windows by focused status and ID
    return Object.values(windowGroups).sort((a, b) => {
      if (a.window.focused && !b.window.focused) return -1
      if (!a.window.focused && b.window.focused) return 1
      return a.window.id - b.window.id
    })
  }

  // Add refresh functionality
  const handleRefresh = () => {
    if (isExtension) {
      collectTabData()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              margin: '0',
              color: '#333',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Tab Monitor Extension
            </h1>
            <p style={{
              margin: '5px 0 0 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Comprehensive tab management and monitoring
            </p>
          </div>
          {isExtension && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        {/* Development Mode Warning */}
        {!isExtension && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <strong>Development Mode:</strong> Chrome extension APIs are not available.
            Showing enhanced mock data for development purposes.
          </div>
        )}

        {/* Debug Info for Development Mode Only */}
        {!isExtension && (
          <div style={{
            background: '#e7f3ff',
            border: '1px solid #b3d9ff',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '25px',
            fontSize: '12px',
            color: '#0066cc'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Debug Info:</strong> Development mode detected.
              Chrome APIs available: {typeof chrome !== 'undefined' ? 'Yes' : 'No'} |
              Tabs API: {typeof chrome?.tabs?.query !== 'undefined' ? 'Yes' : 'No'} |
              Windows API: {typeof chrome?.windows?.getAll !== 'undefined' ? 'Yes' : 'No'} |
              Loading: {loading ? 'Yes' : 'No'} |
              Tabs loaded: {tabs.length} |
              Windows loaded: {windows.length}
            </div>
            <div>
              <a
                href="./test-chrome-apis.html"
                target="_blank"
                style={{
                  color: '#0066cc',
                  textDecoration: 'underline',
                  fontSize: '12px'
                }}
              >
                🔧 Open Chrome APIs Test Page
              </a>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '25px',
            color: '#721c24'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small>Check the browser console for more details.</small>
          </div>
        )}

        {/* Loading State */}
        {loading && isExtension ? (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>Loading tab data...</div>
            <div style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
              This should only take a few seconds. If it's stuck, try refreshing.
            </div>
            <button
              onClick={() => {
                console.log('Manual refresh triggered')
                collectTabData()
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry Loading
            </button>
          </div>
        ) : (
          /* Tab Data Display */
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: '0',
                color: '#333',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Open Tabs ({tabs.length})
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={groupByWindows}
                    onChange={(e) => setGroupByWindows(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  Group by Windows
                </label>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {windows.length} window{windows.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {tabs.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666'
              }}>
                <p>No tabs found</p>
              </div>
            ) : groupByWindows ? (
              /* Window-grouped view */
              <div style={{ display: 'grid', gap: '20px' }}>
                {groupTabsByWindows().map(({ window, tabs: windowTabs }) => (
                  <div key={window.id} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#fff'
                  }}>
                    {/* Window Header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        backgroundColor: window.focused ? '#f8f9ff' : '#f8f9fa',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => toggleWindowCollapse(window.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '14px',
                          transform: collapsedWindows.has(window.id) ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}>
                          ▼
                        </span>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {getWindowTitle(window)}
                        </h3>
                        <span style={{
                          background: window.focused ? '#007bff' : '#6c757d',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {windowTabs.length} tab{windowTabs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Window ID: {window.id}
                      </div>
                    </div>

                    {/* Window Tabs */}
                    {!collapsedWindows.has(window.id) && (
                      <div style={{ padding: '12px' }}>
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {windowTabs.map(tab => (
                            <TabCard key={tab.id} tab={tab} handleGoToTab={handleGoToTab} handleCloseTab={handleCloseTab} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Flat view */
              <div style={{ display: 'grid', gap: '12px' }}>
                {tabs.map(tab => (
                  <TabCard key={tab.id} tab={tab} handleGoToTab={handleGoToTab} handleCloseTab={handleCloseTab} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Extracted TabCard component for reusability
const TabCard = ({ tab, handleGoToTab, handleCloseTab }) => (
  <div style={{
    padding: '20px',
    border: `2px solid ${tab.active ? '#007bff' : '#e0e0e0'}`,
    borderRadius: '12px',
    backgroundColor: tab.active ? '#f8f9ff' : '#fafafa',
    transition: 'all 0.2s ease',
    position: 'relative'
  }}>
    {/* Tab Status Indicators */}
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    }}>
      {tab.active && (
        <span style={{
          background: '#007bff',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          ACTIVE
        </span>
      )}
      {tab.pinned && (
        <span style={{
          background: '#ffc107',
          color: '#212529',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          PINNED
        </span>
      )}
      {tab.isLoading && (
        <span style={{
          background: '#17a2b8',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          LOADING
        </span>
      )}
      {tab.hasAudio && (
        <span style={{
          background: tab.isMuted ? '#6c757d' : '#28a745',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {tab.isMuted ? 'MUTED' : 'AUDIO'}
        </span>
      )}
      {tab.isGrouped && (
        <span style={{
          background: '#6f42c1',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          GROUPED
        </span>
      )}
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      {/* Tab Info */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        {/* Favicon and Title */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          {tab.favIconUrl && (
            <img
              src={tab.favIconUrl}
              alt="favicon"
              style={{
                width: '16px',
                height: '16px',
                marginRight: '8px',
                borderRadius: '2px'
              }}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div style={{
            fontWeight: '600',
            color: '#333',
            fontSize: '16px',
            lineHeight: '1.4'
          }}>
            {tab.title || 'Untitled'}
          </div>
        </div>

        {/* URL and Domain */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '13px',
            color: '#007bff',
            fontWeight: '500',
            marginBottom: '2px'
          }}>
            {tab.domain}
          </div>
          {tab.url && (
            <div style={{
              fontSize: '12px',
              color: '#666',
              wordBreak: 'break-all',
              lineHeight: '1.3'
            }}>
              {tab.url}
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ color: '#666', fontWeight: '500' }}>Last Active</div>
            <div style={{ color: '#333' }}>{tab.idleTimeFormatted}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontWeight: '500' }}>Position</div>
            <div style={{ color: '#333' }}>Tab {tab.index + 1}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
        <button
          onClick={() => handleGoToTab(tab.id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Go to Tab
        </button>
        <button
          onClick={() => handleCloseTab(tab.id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          Close Tab
        </button>
      </div>
    </div>
  </div>
)

export default App
