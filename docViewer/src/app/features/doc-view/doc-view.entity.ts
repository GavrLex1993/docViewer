export interface IDocumentApiModel {
  name: string;
  pages: {
    number: number;
    imageUrl: string;
  }[];
}

export interface IDocumentPage {
  pageNumber: number;
  imageUrl: string;
}

export interface IDocumentData {
  id: string;
  name: string;
  pages: IDocumentPage[];
}

export interface IContainerRect {
  [pageNumber: number]: DOMRect
}
