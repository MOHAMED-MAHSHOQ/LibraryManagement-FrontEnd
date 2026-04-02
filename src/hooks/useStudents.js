import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getStudents,
    searchStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} from '../api/students'

export function useStudents({ search = '', page = 0, size = 20, sortBy = 'id', sortDir = 'asc' } = {}) {
    const isSearching = search.trim().length > 0;

    const { data, isLoading, isError, error } = useQuery({
        // Add search to the queryKey so it refetches when search changes!
        queryKey: ['students', page, size, sortBy, sortDir, search],

        // Dynamically choose which API to call based on search state
        queryFn: () => isSearching
            ? searchStudents({ query: search, page, size })
            : getStudents({ page, size, sortBy, sortDir }),

        keepPreviousData: true,
    })

    return {
        students:      data?.content       || [],
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