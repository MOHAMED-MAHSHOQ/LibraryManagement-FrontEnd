import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} from '../api/students'

export function useStudents({ page = 0, size = 20, sortBy = 'id', sortDir = 'asc' } = {}) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['students', page, size, sortBy, sortDir],
        // queryKey includes all params — different page = different cache entry
        queryFn: () => getStudents({ page, size, sortBy, sortDir }),
        keepPreviousData: true,
        // keeps old data visible while next page loads — no flicker
    })
    return {
        students:      data?.content     || [],
        totalElements: data?.totalElements || 0,
        totalPages:    data?.totalPages    || 0,
        currentPage:   data?.page          || 0,
        isLoading,
        isError,
        error,
    }
}
export function useStudentById(id) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['students', id],
        queryFn: () => getStudentById(id),
        enabled: !!id,
    })
    return { student: data, isLoading, isError }
}

export function useCreateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}

export function useUpdateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateStudent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
        onError: (error) => {
            alert(error.message)
        },
    })
}

export function useDeleteStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
        },
    })
}