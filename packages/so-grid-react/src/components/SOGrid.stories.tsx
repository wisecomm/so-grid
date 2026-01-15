import type { Meta, StoryObj } from '@storybook/react';
import { SOGrid } from './SOGrid';

interface Person {
    id: number;
    name: string;
    age: number;
    role: string;
}

const data: Person[] = [
    { id: 1, name: 'John Doe', age: 28, role: 'Developer' },
    { id: 2, name: 'Jane Smith', age: 34, role: 'Designer' },
    { id: 3, name: 'Sam Johnson', age: 23, role: 'Intern' },
    { id: 4, name: 'Alice Brown', age: 45, role: 'Manager' },
    { id: 5, name: 'Bob Wilson', age: 32, role: 'Developer' },
];

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'role', headerName: 'Role', width: 150 },
];

const meta: Meta<typeof SOGrid> = {
    title: 'Components/SOGrid',
    component: SOGrid,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    argTypes: {
        theme: {
            control: 'select',
            options: ['default', 'dark'],
        },
        pagination: {
            control: 'boolean',
        },
        loading: {
            control: 'boolean',
        },
    },
    // @ts-ignore
} satisfies Meta<typeof SOGrid<Person>>;

export default meta;
type Story = StoryObj<typeof SOGrid<Person>>;

export const Default: Story = {
    args: {
        rowData: data,
        columnDefs: columns,
        style: { height: 400, width: '100%' },
        pagination: true,
        paginationPageSize: 5,
    },
};

export const Loading: Story = {
    args: {
        rowData: [],
        columnDefs: columns,
        loading: true,
        style: { height: 400, width: '100%' },
    },
};
