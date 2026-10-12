"use client";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const columns = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs -ml-3 text-ink-600 hover:text-ink-950 font-mono tracking-wider uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Curriculum Title
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-serif font-medium text-ink-950 text-sm">
          {row.getValue("title")}
        </span>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs -ml-3 text-ink-600 hover:text-ink-950 font-mono tracking-wider uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tuition
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price") || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <span className="font-mono text-xs text-ink-800">{formatted}</span>;
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs -ml-3 text-ink-600 hover:text-ink-950 font-mono tracking-wider uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <Badge variant={isPublished ? "success" : "secondary"}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 text-ink-500 hover:text-ink-950">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/teacher/courses/${id}`}>
                <DropdownMenuItem>
                  <Pencil className="h-3.5 w-3.5 mr-2 text-ink-500" />
                  Edit Course Settings
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
