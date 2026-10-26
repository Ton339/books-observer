export class CreateReviewRequestDto {
    bookId: number;
    comment: string;
    userId: number;
    rating: number;
}

export interface ReviewResponse {
    id: number;
    comment: string;
    rating: number;
    bookId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
}