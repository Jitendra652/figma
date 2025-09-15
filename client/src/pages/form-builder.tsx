import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { Form } from "@shared/schema";

interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const fieldTypes = [
  { id: 'text', name: 'Text Input', icon: 'fas fa-font' },
  { id: 'email', name: 'Email', icon: 'fas fa-envelope' },
  { id: 'password', name: 'Password', icon: 'fas fa-lock' },
  { id: 'textarea', name: 'Textarea', icon: 'fas fa-align-left' },
  { id: 'select', name: 'Select Dropdown', icon: 'fas fa-chevron-down' },
  { id: 'checkbox', name: 'Checkbox', icon: 'fas fa-check-square' },
  { id: 'radio', name: 'Radio Button', icon: 'fas fa-dot-circle' },
];

export default function FormBuilder() {
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/forms", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form created",
        description: "Form has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create form",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormFields([]);
    setIsCreating(false);
    setSelectedForm(null);
  };

  const addField = (type: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: type as FormField['type'],
      label: `New ${type} field`,
      required: false,
      options: type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(fields =>
      fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (fieldId: string) => {
    setFormFields(fields => fields.filter(field => field.id !== fieldId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  const saveForm = () => {
    if (!formName.trim()) {
      toast({
        title: "Form name required",
        description: "Please enter a name for your form",
        variant: "destructive",
      });
      return;
    }

    if (formFields.length === 0) {
      toast({
        title: "Add fields",
        description: "Please add at least one field to your form",
        variant: "destructive",
      });
      return;
    }

    const schema = {
      fields: formFields,
      title: formName,
      description: formDescription,
    };

    createFormMutation.mutate({
      name: formName,
      description: formDescription,
      schema,
    });
  };

  const generateReactCode = () => {
    const imports = `import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';`;

    const formComponent = `
export function ${formName.replace(/\s+/g, '')}Form() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold">${formName}</h2>
      ${formDescription ? `<p className="text-muted-foreground">${formDescription}</p>` : ''}
      
      ${formFields.map(field => {
        switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
            return `
      <div className="space-y-2">
        <Label htmlFor="${field.id}">${field.label}${field.required ? ' *' : ''}</Label>
        <Input
          id="${field.id}"
          type="${field.type}"
          placeholder="${field.placeholder || ''}"
          {...register("${field.id}", { required: ${field.required} })}
        />
        {errors.${field.id} && <p className="text-sm text-destructive">This field is required</p>}
      </div>`;
          case 'textarea':
            return `
      <div className="space-y-2">
        <Label htmlFor="${field.id}">${field.label}${field.required ? ' *' : ''}</Label>
        <Textarea
          id="${field.id}"
          placeholder="${field.placeholder || ''}"
          {...register("${field.id}", { required: ${field.required} })}
        />
        {errors.${field.id} && <p className="text-sm text-destructive">This field is required</p>}
      </div>`;
          default:
            return `<!-- ${field.type} field implementation -->`;
        }
      }).join('\n')}
      
      <Button type="submit">Submit</Button>
    </form>
  );
}`;

    return imports + formComponent;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Form Builder" onAIHelperToggle={() => setShowAIHelper(!showAIHelper)} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {!isCreating && !selectedForm ? (
              // Forms List View
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">Form Builder</h1>
                    <p className="text-muted-foreground">Create dynamic forms with drag-and-drop</p>
                  </div>
                  <Button onClick={() => setIsCreating(true)} data-testid="create-form-button">
                    <i className="fas fa-plus mr-2"></i>
                    Create Form
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms && forms.length > 0 ? (
                    forms.map((form) => (
                      <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`form-card-${form.id}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{form.name}</span>
                            <Badge variant={form.isPublished ? "default" : "secondary"}>
                              {form.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {form.description || "No description"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(form.updatedAt!).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedForm(form)}
                                data-testid={`edit-form-${form.id}`}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`preview-form-${form.id}`}>
                                <i className="fas fa-eye"></i>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <i className="fas fa-wpforms text-6xl text-muted-foreground mb-4"></i>
                      <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Create your first form with our drag-and-drop builder
                      </p>
                      <Button onClick={() => setIsCreating(true)} data-testid="create-first-form-button">
                        <i className="fas fa-plus mr-2"></i>
                        Create Your First Form
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Form Builder View
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Field Types Panel */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-toolbox text-primary"></i>
                      <span>Field Types</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {fieldTypes.map((fieldType) => (
                      <Button
                        key={fieldType.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => addField(fieldType.id)}
                        data-testid={`add-field-${fieldType.id}`}
                      >
                        <i className={`${fieldType.icon} mr-2`}></i>
                        {fieldType.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                {/* Form Builder */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Form Settings</CardTitle>
                        <div className="flex space-x-2">
                          <Button variant="ghost" onClick={resetForm} data-testid="cancel-form-button">
                            Cancel
                          </Button>
                          <Button onClick={saveForm} disabled={createFormMutation.isPending} data-testid="save-form-button">
                            {createFormMutation.isPending ? "Saving..." : "Save Form"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="form-name">Form Name</Label>
                        <Input
                          id="form-name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Enter form name"
                          data-testid="form-name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="form-description">Description</Label>
                        <Textarea
                          id="form-description"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Enter form description"
                          data-testid="form-description-input"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Form Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="form-fields">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2" data-testid="form-fields-container">
                              {formFields.length > 0 ? (
                                formFields.map((field, index) => (
                                  <Draggable key={field.id} draggableId={field.id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="p-4 border border-border rounded-lg hover:bg-muted/50"
                                        data-testid={`form-field-${field.id}`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <i className="fas fa-grip-vertical text-muted-foreground"></i>
                                            <div>
                                              <p className="font-medium">{field.label}</p>
                                              <p className="text-sm text-muted-foreground">{field.type}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {field.required && (
                                              <Badge variant="outline" className="text-xs">Required</Badge>
                                            )}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingField(field)}
                                              data-testid={`edit-field-${field.id}`}
                                            >
                                              <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeField(field.id)}
                                              data-testid={`remove-field-${field.id}`}
                                            >
                                              <i className="fas fa-trash text-destructive"></i>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                                  <i className="fas fa-plus-circle text-4xl mb-2"></i>
                                  <p>Drop fields here or click on field types to add them</p>
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview Panel */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-eye text-accent"></i>
                      <span>Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {formName && <h3 className="text-lg font-semibold">{formName}</h3>}
                      {formDescription && <p className="text-sm text-muted-foreground">{formDescription}</p>}
                      
                      {formFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-sm">{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
                          {field.type === 'textarea' ? (
                            <Textarea placeholder={field.placeholder} disabled className="text-sm" />
                          ) : field.type === 'select' ? (
                            <Select disabled>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </Select>
                          ) : (
                            <Input type={field.type} placeholder={field.placeholder} disabled className="text-sm" />
                          )}
                        </div>
                      ))}
                      
                      {formFields.length > 0 && (
                        <Button className="w-full" disabled>Submit</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Field Edit Dialog */}
      <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
        <DialogContent data-testid="field-edit-dialog">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Field Label</Label>
                <Input
                  value={editingField.label}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  data-testid="field-label-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={editingField.placeholder || ''}
                  onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                  data-testid="field-placeholder-input"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={editingField.required}
                  onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                  data-testid="field-required-checkbox"
                />
                <Label htmlFor="required">Required field</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => setEditingField(null)}>Cancel</Button>
                <Button
                  onClick={() => {
                    updateField(editingField.id, editingField);
                    setEditingField(null);
                  }}
                  data-testid="save-field-button"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
