import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importStudentsCsv, importBooksCsv } from '../api/imports'

function StatBox({ label, value, color }) {
    return (
        <div style={{
            backgroundColor: '#0f0f23', borderRadius: '6px',
            padding: '12px', textAlign: 'center',
        }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color, lineHeight: 1 }}>
                {value ?? 0}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
            </div>
        </div>
    )
}

function ImportCard({ title, description, accentColor, onImport, loading, result, onReset }) {
    const inputRef = useRef()

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!file.name.endsWith('.csv')) { alert('Please select a .csv file'); return }
        await onImport(file)
        inputRef.current.value = ''
    }

    return (
        <div style={{
            backgroundColor: '#1a1a2e',
            border: `1px solid ${accentColor}30`,
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
                <>
                    <input ref={inputRef} type="file" accept=".csv"
                           onChange={handleFile} style={{ display: 'none' }} id={`file-${title}`} />
                    <label htmlFor={`file-${title}`} style={{
                        display: 'block', border: `2px dashed ${accentColor}40`,
                        borderRadius: '8px', padding: '36px', textAlign: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                    }}>
                        {loading ? (
                            <div>
                                <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
                                <div style={{ fontSize: '13px', color: '#9ca3af' }}>Importing — please wait...</div>
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Large files may take a moment</div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>Click to select CSV file</div>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>.csv only — up to 50 MB</div>
                            </div>
                        )}
                    </label>
                </>
            ) : (
                <div>
                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        <StatBox label="Total rows" value={result.totalRows} color="#9ca3af" />
                        <StatBox label="Imported"   value={result.imported}  color="#4ade80" />
                        <StatBox label="Skipped"    value={result.skipped}   color="#fbbf24" />
                        <StatBox label="Failed"     value={result.failed}    color="#f87171" />
                    </div>

                    {/* Summary message */}
                    <div style={{
                        padding: '10px 14px', borderRadius: '6px', marginBottom: '12px',
                        backgroundColor: result.imported > 0 ? '#14532d' : '#1e1e1e',
                        border: `1px solid ${result.imported > 0 ? '#166534' : '#2a2a4e'}`,
                        fontSize: '12px',
                        color: result.imported > 0 ? '#4ade80' : '#9ca3af',
                    }}>
                        {result.imported > 0
                            ? `✓ Successfully imported ${result.imported} records.`
                            : '⚠ No new records were imported.'}
                        {result.skipped > 0 && (
                            <span style={{ color: '#fbbf24', marginLeft: '8px' }}>
                                {result.skipped} duplicate{result.skipped > 1 ? 's' : ''} skipped.
                            </span>
                        )}
                    </div>

                    {/* Error list */}
                    {result.errors && result.errors.length > 0 && (
                        <div style={{
                            backgroundColor: '#0f0f23', borderRadius: '6px',
                            padding: '12px', marginBottom: '12px',
                            maxHeight: '200px', overflowY: 'auto',
                            border: '1px solid #2a2a4e',
                        }}>
                            <div style={{
                                fontSize: '11px', color: '#f87171', fontWeight: '600',
                                marginBottom: '8px', display: 'flex', justifyContent: 'space-between',
                            }}>
                                <span>Errors / Validation failures</span>
                                <span style={{ color: '#6b7280' }}>
                                    {result.errors.length}{result.errors.length === 50 ? '+' : ''} shown
                                </span>
                            </div>
                            {result.errors.map((err, i) => (
                                <div key={i} style={{
                                    fontSize: '11px', color: '#9ca3af',
                                    marginBottom: '4px', paddingLeft: '8px',
                                    borderLeft: '2px solid #ef444440',
                                    lineHeight: '1.5',
                                }}>
                                    {err}
                                </div>
                            ))}
                            {result.errors.length === 50 && (
                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>
                                    Only first 50 errors shown. Fix these and re-import.
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={onReset} style={{
                        width: '100%', backgroundColor: 'transparent',
                        border: `1px solid ${accentColor}50`, color: accentColor,
                        borderRadius: '6px', padding: '8px', fontSize: '12px', cursor: 'pointer',
                    }}>
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
            // Invalidate all student caches so dashboard + list update immediately
            queryClient.invalidateQueries({ queryKey: ['students'] })
            queryClient.invalidateQueries({ queryKey: ['students-summary'] })
            queryClient.invalidateQueries({ queryKey: ['students-departments'] })
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
            // Invalidate all book caches so dashboard + list + unassigned update immediately
            queryClient.invalidateQueries({ queryKey: ['books'] })
            queryClient.invalidateQueries({ queryKey: ['books-summary'] })
            queryClient.invalidateQueries({ queryKey: ['books-genres'] })
        } catch (e) {
            alert('Import failed: ' + e.message)
        } finally {
            setBooksLoading(false)
        }
    }

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>CSV Import</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    Bulk import students and books from CSV files
                </p>
            </div>

            {/* Format guide */}
            <div style={{
                backgroundColor: '#1a1a2e', border: '1px solid #2a2a4e',
                borderRadius: '10px', padding: '16px 20px', marginBottom: '24px',
            }}>
                <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '10px' }}>
                    CSV format requirements
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                        {
                            label: 'students.csv', color: '#818cf8',
                            sample: 'name,email,phone,department\nAlice,alice@uni.edu,9876540001,CS\nBob,bob@uni.edu,9876540002,Maths',
                        },
                        {
                            label: 'books.csv', color: '#34d399',
                            sample: 'title,author,genre,isbn\nClean Code,R.Martin,CS,ISBN-101\nCalculus,Apostol,Maths,ISBN-102',
                        },
                    ].map(({ label, color, sample }) => (
                        <div key={label}>
                            <div style={{ fontSize: '12px', color, fontWeight: '500', marginBottom: '4px' }}>{label}</div>
                            <div style={{
                                backgroundColor: '#0f0f23', borderRadius: '6px', padding: '10px',
                                fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', lineHeight: '1.7',
                                whiteSpace: 'pre',
                            }}>{sample}</div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280' }}>
                    ℹ Duplicate emails (students) and duplicate ISBNs (books) are automatically skipped — no crash, just reported as Skipped.
                    ISBN format must be <span style={{ color: '#a5b4fc' }}>ISBN-</span> followed by 3+ digits (e.g. ISBN-101, ISBN-1001).
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <ImportCard
                    title="Import students"
                    description="Upload a CSV with columns: name, email, phone, department. Duplicate emails are skipped."
                    accentColor="#818cf8"
                    onImport={handleImportStudents}
                    loading={studentsLoading}
                    result={studentsResult}
                    onReset={() => setStudentsResult(null)}
                />
                <ImportCard
                    title="Import books"
                    description="Upload a CSV with columns: title, author, genre, isbn. ISBN must be ISBN-001 format. Duplicate ISBNs are skipped."
                    accentColor="#34d399"
                    onImport={handleImportBooks}
                    loading={booksLoading}
                    result={booksResult}
                    onReset={() => setBooksResult(null)}
                />
            </div>
        </div>
    )
}