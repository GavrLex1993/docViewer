export type AnnotationType = 'text' | 'image' | 'icon';

export interface IAnnotationBase {
  id: string;
  type: AnnotationType;
  pageNumber: number;
  x: number;
  y: number;
}

export interface ITextAnnotation extends IAnnotationBase {
  type: 'text';
  text: string;
}

export type Annotation = ITextAnnotation; // Other types may be added in the future, but for now only text is supported.
