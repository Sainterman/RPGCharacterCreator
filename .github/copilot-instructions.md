# GitHub Copilot Instructions for RPGCharacterCreator

## Project Overview

This is a character creation and character sheet application for playing **Mage: The Ascension 20th Edition**, a tabletop roleplaying game. The application helps players create and manage their character sheets according to the game's rules and mechanics.

## Project Context

- **Game System**: Mage: The Ascension 20th Edition
- **Purpose**: Character creation and character sheet management
- **Target Users**: Tabletop RPG players familiar with Mage: The Ascension

## Coding Guidelines

### General Principles

1. **Clarity over Cleverness**: Write code that is easy to understand and maintain
2. **Consistency**: Follow existing code patterns and conventions in the repository
3. **Documentation**: Comment complex game mechanics or rule implementations
4. **Testing**: Write tests for game logic and character creation rules

### Game Mechanics

When working with game mechanics:

- Accurately implement rules from Mage: The Ascension 20th Edition
- Add comments referencing specific page numbers or rule sections when applicable
- Validate character data according to game rules (e.g., attribute ranges, skill limits)
- Handle edge cases in character creation (multiclassing, special abilities, etc.)

### Code Organization

- Keep character creation logic separate from UI/presentation code
- Use clear naming conventions that reflect game terminology
- Group related functionality (attributes, skills, backgrounds, etc.) into modules
- Maintain data validation separate from business logic

### Best Practices

1. **Error Handling**: Provide clear error messages for invalid character data
2. **Data Validation**: Validate all user inputs against game rules
3. **Extensibility**: Design with future features in mind (campaigns, character progression, etc.)
4. **Accessibility**: Ensure the application is usable by all players
5. **Performance**: Optimize for responsive character sheet operations

## File Organization

Maintain a clear project structure:

- Keep game rules and data separate from application logic
- Store character templates and presets in dedicated directories
- Organize tests to mirror the source code structure

## Testing

- Test character creation workflows end-to-end
- Validate game rule implementations with unit tests
- Test edge cases and boundary conditions for attributes and skills
- Include integration tests for character sheet persistence

## Documentation

- Document game-specific terminology for developers unfamiliar with Mage: The Ascension
- Include examples of character creation workflows
- Maintain a changelog for rule updates or game mechanics changes
- Document any house rules or variations from standard rules

## Contributing

When suggesting code changes:

- Ensure compatibility with Mage: The Ascension 20th Edition rules
- Consider the user experience of character creation
- Maintain backwards compatibility with existing character data
- Follow the established code style and patterns
