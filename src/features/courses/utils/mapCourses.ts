import { Course, RandomProduct, RandomUser } from "../types";

export const mapProductsToCourses = (
  products: RandomProduct[],
  instructors: RandomUser[],
): Course[] => {
  if (instructors.length === 0) {
    return [];
  }

  return products.map((product, index) => {
    const instructor = instructors[index % instructors.length];

    const thumbnail =
      product.thumbnail ||
      product.images?.find((uri) => uri.includes("thumbnail")) ||
      product.images?.[0] ||
      "";

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      thumbnail,
      images: product.images,
      price: product.price,
      rating: product.rating,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      discountPercentage: product.discountPercentage,
      instructor: {
        id: instructor.id,
        name: `${instructor.name.first} ${instructor.name.last}`.trim(),
        email: instructor.email,
        picture: instructor.picture.medium,
      },
    };
  });
};

export const mapProductAndInstructorToCourse = (
  product: RandomProduct,
  instructor: RandomUser,
): Course => {
  const thumbnail =
    product.thumbnail ||
    product.images?.find((uri) => uri.includes("thumbnail")) ||
    product.images?.[0] ||
    "";

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    thumbnail,
    images: product.images,
    price: product.price,
    rating: product.rating,
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    discountPercentage: product.discountPercentage,
    instructor: {
      id: instructor.id,
      name: `${instructor.name.first} ${instructor.name.last}`.trim(),
      email: instructor.email,
      picture: instructor.picture.medium,
    },
  };
};

export const filterCoursesByQuery = (
  courses: Course[],
  query: string,
): Course[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return courses;
  }

  return courses.filter((course) => {
    const haystack = [
      course.title,
      course.description,
      course.category,
      course.brand,
      course.instructor.name,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
};
