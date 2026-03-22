import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} from '../api/students'

export function useStudents() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['students'],
        queryFn: getStudents,
    })
    return {
        students: data || [],
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
    })
}

export function useUpdateStudent() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => updateStudent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] })
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