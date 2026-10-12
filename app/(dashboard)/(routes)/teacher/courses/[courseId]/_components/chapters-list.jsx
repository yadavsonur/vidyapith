"use client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { GripVertical, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ChapterList = ({ items, onReorder, onEdit }) => {
  const [chapters, setChapters] = useState(items);

  useEffect(() => {
    setChapters(items);
  }, [items]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(chapters);
    const [reorderItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderItem);
    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);
    const updatedChapters = items.slice(startIndex, endIndex + 1);
    setChapters(items);
    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));
    onReorder(bulkUpdateData);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {chapters.map((chapter, index) => (
              <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-parchment-50 border border-ink-200/80 text-ink-900 rounded-md text-xs transition-colors hover:border-ink-400 group",
                      chapter.isPublished && "bg-white border-ink-200 shadow-subtle"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className="px-2.5 py-3 border-r border-ink-200/80 hover:bg-parchment-100 rounded-l-md transition cursor-grab active:cursor-grabbing text-ink-400 group-hover:text-ink-700"
                      {...provided.dragHandleProps}
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="flex items-center gap-2 py-2 px-1 truncate flex-1">
                      <span className="font-mono text-[11px] text-ink-400">
                        {String(index + 1).padStart(2, "0")}.
                      </span>
                      <span className="font-medium truncate">{chapter.title}</span>
                    </div>

                    <div className="ml-auto pr-3 flex items-center gap-x-2">
                      {chapter.isFree && (
                        <Badge variant="ochre" className="text-[10px]">
                          Preview
                        </Badge>
                      )}
                      <Badge
                        variant={chapter.isPublished ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {chapter.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => onEdit(chapter.id)}
                        className="p-1 rounded hover:bg-parchment-100 text-ink-500 hover:text-ink-950 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
