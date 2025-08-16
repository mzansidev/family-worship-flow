
# Principles Library - Administrator Guide

## How to Add Articles to the Principles Library

As an administrator, you can add new articles to the Principles Library through the web interface. This guide explains the process and available categories.

### Available Categories

The Principles Library is organized into four main categories:

1. **Getting Started** (`getting-started`)
   - Foundational principles for beginning family worship
   - Basic concepts and importance of family devotions
   - Overcoming obstacles to starting family worship

2. **Engaging Children** (`engaging-children`)
   - Age-appropriate worship activities
   - Making worship interesting for kids
   - Involving children in family devotions

3. **Building Consistency** (`building-consistency`)
   - Establishing regular worship routines
   - Overcoming challenges to consistency
   - Time management for family worship

4. **Deepening Faith** (`spiritual-growth`)
   - Advanced spiritual concepts
   - Growing in faith as a family
   - Strengthening spiritual bonds

### Adding Articles Through the Web Interface

1. **Access the Principles Library**
   - Navigate to the Principles Library section
   - You must be logged in with an admin account

2. **Create New Article**
   - Click the green "Add New Article" button
   - This will open the article creation form

3. **Fill in Article Details**
   - **Title**: Enter a descriptive title for the article
   - **Category**: Select the appropriate category from the dropdown
   - **Content**: Enter the full article content in the text area

4. **Reading Time Calculation**
   - The system automatically calculates reading time based on word count
   - Uses an average reading speed of 200 words per minute
   - The estimated reading time appears below the content field as you type

5. **Submit the Article**
   - Click "Create Article" to save
   - The article will be immediately available to all users
   - New articles are marked with an "is_new" flag

### Content Guidelines

#### Formatting
- Use plain text format
- Paragraphs should be separated by double line breaks
- Bible references should follow standard format (e.g., "Hebrews 4:16")
- Use proper punctuation and grammar

#### Length Recommendations
- **Getting Started**: 2-5 minute read (400-1000 words)
- **Engaging Children**: 3-6 minute read (600-1200 words)
- **Building Consistency**: 2-4 minute read (400-800 words)
- **Deepening Faith**: 4-8 minute read (800-1600 words)

#### Content Quality
- Ensure content is appropriate for family audiences
- Focus on practical, actionable advice
- Include relevant Bible references where applicable
- Keep language clear and accessible

### Managing Existing Articles

#### Viewing Articles
- Browse articles by clicking on category tiles
- Each article shows its reading time and category

#### Deleting Articles
- Admin users can delete articles using the trash icon
- Deletion requires confirmation
- This action cannot be undone

### Technical Details

#### Database Structure
Articles are stored in the `principles_content` table with the following fields:
- `id`: Unique identifier
- `title`: Article title
- `content`: Full article text
- `category_id`: Category identifier
- `read_time`: Automatically calculated reading time
- `is_new`: Flag for new articles
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

#### Reading Time Algorithm
```
Words in content ÷ 200 words per minute = Reading time in minutes
```
- Rounds to nearest minute
- Minimum 1 minute for any content
- Updates automatically when content changes

### Best Practices

1. **Category Selection**
   - Choose the most appropriate category based on the article's primary focus
   - Consider your target audience (beginners vs. experienced families)

2. **Title Writing**
   - Keep titles concise but descriptive
   - Avoid special characters that might cause display issues
   - Make titles engaging and relevant

3. **Content Organization**
   - Start with a clear introduction
   - Use logical paragraph breaks
   - End with practical application or takeaways

4. **Review Process**
   - Preview content before publishing
   - Check for typos and formatting issues
   - Ensure content aligns with the app's purpose

### Troubleshooting

#### Common Issues
- **Long loading times**: Large articles may take time to save
- **Formatting issues**: Use plain text only, no special formatting
- **Category not showing**: Ensure you've selected a valid category

#### Getting Help
- Check browser console for error messages
- Verify admin permissions are properly set
- Contact technical support if articles don't appear after creation

### Future Enhancements

The system is designed to accommodate future features such as:
- Article editing capabilities
- Content versioning
- User feedback and ratings
- Search functionality
- Content scheduling

---

*Last updated: [Current Date]*
*For technical support, contact the development team*
