export interface SchemaParams {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author?: { name: string; url?: string; linkedinUrl?: string; photoUrl?: string };
  publisher: { name: string; url: string };
  faqItems?: Array<{ question: string; answer: string }>;
}

export function generateArticleSchema(params: SchemaParams): object {
  const graph: object[] = [];

  // Article schema
  const article: Record<string, unknown> = {
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    publisher: {
      '@type': 'Organization',
      name: params.publisher.name,
      url: params.publisher.url,
    },
  };

  if (params.author) {
    const sameAs: string[] = [];
    if (params.author.linkedinUrl) sameAs.push(params.author.linkedinUrl);

    article.author = {
      '@type': 'Person',
      name: params.author.name,
      ...(params.author.url ? { url: params.author.url } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };

    // Person schema
    graph.push({
      '@type': 'Person',
      name: params.author.name,
      ...(params.author.url ? { url: params.author.url } : {}),
      ...(params.author.photoUrl ? { image: params.author.photoUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    });
  }

  graph.unshift(article);

  // FAQ schema
  if (params.faqItems && params.faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: params.faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  // BreadcrumbList
  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: params.publisher.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${params.publisher.url}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: params.title,
        item: params.url,
      },
    ],
  });

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
