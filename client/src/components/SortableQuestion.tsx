import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";

interface SortableQuestionProps {
  question: any;
  index: number;
  onDelete: (id: number) => void;
}

export function SortableQuestion({ question, index, onDelete }: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  let options = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch (e) {
    options = question.options ? question.options.split("\n").filter((opt: string) => opt.trim()) : [];
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-l-4 border-l-[#0D6EB2]"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">
                Q{index + 1}. {question.questionText}
                {question.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
              <CardDescription className="mt-1">
                Type: {
                  question.questionType === "text" ? "Texte court" :
                  question.questionType === "textarea" ? "Texte long" :
                  question.questionType === "radio" ? "Choix unique" :
                  question.questionType === "checkbox" ? "Choix multiples" :
                  "Liste déroulante"
                }
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      {options.length > 0 && (
        <CardContent>
          <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {options.map((option: string, i: number) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
