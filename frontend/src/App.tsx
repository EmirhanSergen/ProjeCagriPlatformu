import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './components/AuthProvider'
import { appRoutes } from './routes'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="w-full max-w-screen-2xl mx-auto p-4 space-y-8 flex-grow">
            <Suspense fallback={<div className="text-center">Yükleniyor...</div>}>
              <Routes>
                {appRoutes.map((route, index) => {
                  if ('children' in route && route.children) {
                    return (
                      <Route key={index} path={route.path} element={route.element}>
                        {route.children.map((child, childIndex) => (
                          <Route key={childIndex} index={child.index} path={child.path} element={child.element} />
                        ))}
                      </Route>
                    )
                  }
                  return <Route key={index} path={route.path} element={route.element} />
                })}
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
