export interface PageMeta {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    canonical: string;
}

export interface Post {
    uid: string;
    title: string;
    subtitle: string;
    description: string;
    authorFirstName: string;
    authorLastName: string;
    createdAt: string;
    modifiedAt: string;
    tags: string[];
    featuredImage: string;
    featuredImageAlt: string;
}
