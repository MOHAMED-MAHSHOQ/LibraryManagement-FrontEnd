import axios from './axios'

export const importStudentsCsv = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export const importBooksCsv = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/import/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}