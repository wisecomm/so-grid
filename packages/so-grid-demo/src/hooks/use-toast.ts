export const useToast = () => {
    return {
        toast: (props: any) => console.log("Toast:", props),
        dismiss: (id?: string) => { },
    }
}
