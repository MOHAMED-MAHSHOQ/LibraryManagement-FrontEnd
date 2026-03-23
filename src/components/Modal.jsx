import { useState } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div
            // onClick={onClose}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #2a2a4e',
                    borderRadius: '10px',
                    padding: '24px',
                    width: '480px',
                    maxWidth: '90vw',
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6b7280',
                            fontSize: '20px',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: '4px',
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}