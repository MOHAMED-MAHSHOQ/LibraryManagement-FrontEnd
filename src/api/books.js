import api from './axios'

export const getBooks = ({ page = 0, size = 20, sortBy = 'id', sortDir = 'asc' } = {}) => {
    return api.get('/books', {
        params: { page, size, sortBy, sortDir }
    })
}
export const searchBooks = ({ query, page = 0, size = 20 } = {}) => {
    return api.get('/books/search', {
        params: { query, page, size }
    })
}

export const getBookById = (id) => api.get(`/books/${id}`)

export const getUnassignedBooks = () => api.get('/books/unassigned')

export const createBook = (data) => api.post('/books', data)

export const updateBook = (id, data) => api.put(`/books/${id}`, data)

export const deleteBook = (id) => api.delete(`/books/${id}`)

export const assignBookToStudent = (studentId, bookId) =>
    api.post(`/students/${studentId}/books/${bookId}`)

export const removeBookFromStudent = (studentId, bookId) =>
    api.delete(`/students/${studentId}/books/${bookId}`)