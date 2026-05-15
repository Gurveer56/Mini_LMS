export interface PaginatedResponse<T> {
  statusCode: number;
  data: {
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    totalItems: number;
    currentPageItems: number;
    data: T[];
  };
  message: string;
  success: boolean;
}

export interface RandomUserName {
  title: string;
  first: string;
  last: string;
}

export interface RandomUserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface RandomUser {
  id: number;
  email: string;
  name: RandomUserName;
  picture: RandomUserPicture;
}

export interface RandomProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface CourseInstructor {
  id: number;
  name: string;
  email: string;
  picture: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  price: number;
  rating: number;
  category: string;
  brand: string;
  stock: number;
  discountPercentage: number;
  instructor: CourseInstructor;
}
