import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getBooks,
    getUnassignedBooks,
    createBook,
    updateBook,
    deleteBook,
    assignBookToStudent,
    removeBookFromStudent,
} from '../api/books'

// export function useBooks() {
//     const { data, isLoading, isError, error } = useQuery({
//         queryKey: ['books'],
//         queryFn: getBooks,
//     })
//     return {
//         books: data || [],
//         isLoading,
//         isError,
//         error,
//     }
// }

export function useBooks({ page = 0, size = 20, sortBy = 'id', sortDir = 'asc' } = {}) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['books', page, size, sortBy, sortDir],
        queryFn: () => getBooks({ page, size, sortBy, sortDir }),
        keepPreviousData: true,
    })
    return {
        books:         data?.content       || [],
        totalElements: data?.totalElements || 0,
        totalPages:    data?.totalPages    || 0,
        currentPage:   data?.page          || 0,
        isLoading,
        isError,
        error,
    }
}

export function useUnassignedBooks() {
    const { data, isLoading } = useQuery({
        queryKey: ['books', 'unassigned'],
        queryFn: getUnassignedBooks,
    })
    return {
        unassignedBooks: data || [],
        isLoading,
    }
}

export function useCreateBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] })
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}

export function useUpdateBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateBook(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] })
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}
export function useDeleteBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteBook,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] })
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}

export function useAssignBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ studentId, bookId }) =>
            assignBookToStudent(studentId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] })
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}

export function useRemoveBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ studentId, bookId }) =>
            removeBookFromStudent(studentId, bookId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] })
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}