import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importStudentsCsv, importBooksCsv } from '../api/imports'

function ImportCard({ title, description, color, onImport, loading, result, onReset }) {
    const inputRef = useRef()

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.name.endsWith('.csv')) {
            alert('Please select a .csv file')
            return
        }
        await onImport(file)
        inputRef.current.value = ''
    }

    return (
        <div style={{
            backgroundColor: '#1a1a2e',
            border: `1px solid ${color}30`,
            borderRadius: '10px',
            padding: '24px',
        }}>
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
                    {title}
                </h2>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                    {description}
                </p>
            </div>

            {!result ? (
                <div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFile}
                        style={{ display: 'none' }}
                        id={`file-${title}`}
                    />
                    <label
                        htmlFor={`file-${title}`}
                        style={{
                            display: 'block',
                            border: `2px dashed ${color}50`,
                            borderRadius: '8px',
                            padding: '32px',
                            textAlign: 'center',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'border-color 0.2s',
                        }}
                    >
                        {loading ? (
                            <div>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                                    Importing... please wait
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                    Large files may take a moment
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
                                    Click to select CSV file
                                </div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                    .csv files only — no size limit
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            ) : (
                <div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px',
                        marginBottom: '16px',
                    }}>
                        {[
                            { label: 'Total rows', value: result.totalRows, color: '#9ca3af' },
                            { label: 'Imported',   value: result.imported,  color: '#4ade80' },
                            { label: 'Skipped',    value: result.skipped,   color: '#fbbf24' },
                            { label: 'Failed',     value: result.failed,    color: '#f87171' },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                backgroundColor: '#0f0f23',
                                borderRadius: '6px',
                                padding: '10px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '600', color: stat.color }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {result.errors && result.errors.length > 0 && (
                        <div style={{
                            backgroundColor: '#0f0f23',
                            borderRadius: '6px',
                            padding: '12px',
                            marginBottom: '12px',
                            maxHeight: '150px',
                            overflowY: 'auto',
                        }}>
                            <div style={{ fontSize: '11px', color: '#f87171', fontWeight: '500', marginBottom: '6px' }}>
                                Errors ({result.errors.length}{result.errors.length === 50 ? '+' : ''}):
                            </div>
                            {result.errors.map((err, i) => (
                                <div key={i} style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                                    {err}
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={onReset}
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            border: `1px solid ${color}50`,
                            color: color,
                            borderRadius: '6px',
                            padding: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Import another file
                    </button>
                </div>
            )}
        </div>
    )
}

export default function Import() {
    const queryClient = useQueryClient()
    const [studentsLoading, setStudentsLoading] = useState(false)
    const [booksLoading,    setBooksLoading]    = useState(false)
    const [studentsResult,  setStudentsResult]  = useState(null)
    const [booksResult,     setBooksResult]     = useState(null)

    const handleImportStudents = async (file) => {
        setStudentsLoading(true)
        try {
            const result = await importStudentsCsv(file)
            setStudentsResult(result)
            queryClient.invalidateQueries({ queryKey: ['students'] })
        } catch (e) {
            alert('Import failed: ' + e.message)
        } finally {
            setStudentsLoading(false)
        }
    }

    const handleImportBooks = async (file) => {
        setBooksLoading(true)
        try {
            const result = await importBooksCsv(file)
            setBooksResult(result)
            queryClient.invalidateQueries({ queryKey: ['books'] })
        } catch (e) {
            alert('Import failed: ' + e.message)
        } finally {
            setBooksLoading(false)
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>
                    CSV Import
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    Bulk import students and books from CSV files
                </p>
            </div>

            <div style={{
                backgroundColor: '#1a1a2e',
                border: '1px solid #2a2a4e',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '24px',
            }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '10px' }}>
                    CSV format requirements
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#818cf8', fontWeight: '500', marginBottom: '4px' }}>
                            students.csv
                        </div>
                        <div style={{
                            backgroundColor: '#0f0f23',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: '#9ca3af',
                            lineHeight: '1.6',
                        }}>
                            name,email,phone,department<br/>
                            Alice,alice@uni.edu,9876540001,CS<br/>
                            Bob,bob@uni.edu,9876540002,Maths
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '500', marginBottom: '4px' }}>
                            books.csv
                        </div>
                        <div style={{
                            backgroundColor: '#0f0f23',
                            borderRadius: '6px',
                            padding: '10px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: '#9ca3af',
                            lineHeight: '1.6',
                        }}>
                            title,author,genre,isbn<br/>
                            Clean Code,R.Martin,CS,ISBN-101<br/>
                            Calculus,Apostol,Maths,ISBN-102
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <ImportCard
                    title="Import students"
                    description="Upload a CSV with columns: name, email, phone, department. Duplicate emails are skipped automatically."
                    color="#818cf8"
                    onImport={handleImportStudents}
                    loading={studentsLoading}
                    result={studentsResult}
                    onReset={() => setStudentsResult(null)}
                />
                <ImportCard
                    title="Import books"
                    description="Upload a CSV with columns: title, author, genre, isbn. ISBN format must be ISBN-001. Duplicate ISBNs are skipped."
                    color="#34d399"
                    onImport={handleImportBooks}
                    loading={booksLoading}
                    result={booksResult}
                    onReset={() => setBooksResult(null)}
                />
            </div>
        </div>
    )
}