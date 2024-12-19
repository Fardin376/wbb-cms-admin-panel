import React, { useEffect } from 'react';
import axiosInstance from '../../../../../utils/axios.config';

const CategoryListBlock = ({ editor, category, language }) => {
  useEffect(() => {
    if (editor && category) {
      editor.DomComponents.addType('category-list-component', {
        model: {
          defaults: {
            tagName: 'div',
            classes: ['category-list-block'],
            attributes: {
              'data-category-id': category._id,
              'data-language': language,
            },
            components: [
              {
                tagName: 'h3',
                content: `${
                  category.name[language]
                } (${language.toUpperCase()})`,
              },
              {
                tagName: 'ul',
                classes: ['content-list'],
                content: '<li>Loading content...</li>', // Initial loading state
              },
            ],
          },

          initialize() {
            this.listenTo(
              this,
              'change:attributes:data-category-id',
              this.updateContent
            );
            this.listenTo(
              this,
              'change:attributes:data-language',
              this.updateContent
            );
            this.updateContent();
          },

          async updateContent() {
            const categoryId = this.getAttributes()['data-category-id'];
            const language = this.getAttributes()['data-language'];

            const contentList = this.components().find((comp) => {
              console.log(comp); // Log the component to inspect its structure
              return comp && comp.get && comp.get('tagName') === 'ul';
            });

            if (!contentList) return;

            if (!categoryId || !language) {
              contentList.components('<li>No data available.</li>');
              return;
            }

            try {
              contentList.components('<li>Loading content...</li>'); // Loading state
              const response = await axiosInstance.get(`/posts/by-category/${categoryId}`);
              const data = response.data.posts;

              if (!data || data.length === 0) {
                contentList.components('<li>No content found.</li>');
                return;
              }

              const renderedContent =
                data &&
                data
                  .map(
                    (content) =>
                      `<li><a href="/content/${
                        content._id
                      }" target="_blank" rel="noopener noreferrer">${
                        content.title[language] || 'Untitled'
                      }</a></li>`
                  )
                  .join('');

              contentList.components(renderedContent);
            } catch (error) {
              console.error('Error fetching content:', error);
              contentList.components(
                '<li>Error loading content. Please try again later.</li>'
              );
            }
          },
        },
      });

      editor.BlockManager.add('category-list-component', {
        label: `Category List: ${category.name[language]}`,
        content: {
          type: 'category-list-component',
          attributes: {
            'data-category-id': category._id,
            'data-language': language,
          },
        },
        category: `${category.name[language]}`,
        attributes: { class: 'fa fa-list' },
      });

      return () => {
        editor.BlockManager.remove('category-list-component');
        editor.DomComponents.removeType('category-list-component');
      };
    }
  }, [editor, category, language]);

  return null;
};

export default CategoryListBlock;
