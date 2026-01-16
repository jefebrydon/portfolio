# Button Icon Components

Reusable button icon components matching the Figma design specifications.

## Components

### `Button_Icon_Primary`

A primary button with an upward arrow icon. Used for submit/action buttons.

**Props:**
- `onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void` - Click handler
- `disabled?: boolean` - Disabled state (default: false)
- `ariaLabel?: string` - Accessibility label (default: 'Submit')
- `className?: string` - Additional CSS classes

**States:**
- **Default**: Transparent background, teal icon (#229DB1)
- **Hover**: Light teal background (#dffcff), teal icon
- **Disabled**: Transparent background, light grey icon

### `Button_Icon_Secondary`

A secondary button with a close/X icon. Used for close/cancel actions.

**Props:**
- `onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void` - Click handler
- `disabled?: boolean` - Disabled state (default: false)
- `ariaLabel?: string` - Accessibility label (default: 'Close')
- `className?: string` - Additional CSS classes

**States:**
- **Default**: Transparent background, dark grey icon (#666666)
- **Hover**: Light grey background (#f1f1f1), dark grey icon
- **Disabled**: Light grey background, light grey icon

## Usage

```tsx
import { Button_Icon_Primary, Button_Icon_Secondary } from './components';

// Primary button
<Button_Icon_Primary
  onClick={() => console.log('Clicked')}
  ariaLabel="Send message"
/>

// Secondary button
<Button_Icon_Secondary
  onClick={() => console.log('Closed')}
  ariaLabel="Close dialog"
/>

// Disabled state
<Button_Icon_Primary
  disabled={true}
  ariaLabel="Submit (disabled)"
/>
```

## Design Specifications

- **Button size**: 32px × 32px
- **Border radius**: 999px (fully rounded)
- **Icon sizes**: 
  - Primary: 15px × 16px (arrow)
  - Secondary: 20px × 20px (close)
- **Transitions**: 150ms ease for background-color, color, and opacity
- **Colors**: Uses CSS variables from `jeff-brydon.webflow.css`

## Integration

These components are designed to be interchangeable and can be used in:
- JeffBot input field (replacing the current arrow icon)
- JeffBot sidebar close button
- Any other UI requiring icon buttons

Make sure to import the CSS file in your main stylesheet or component:

```tsx
import './components/Button_Icon.css';
```

---

## Message Components

Reusable message bubble components for the JeffBot chat interface, matching the Figma design specifications.

### `Message_User`

A message bubble component for user messages. Displays with a white background, subtle shadow, and right alignment.

**Props:**
- `children?: React.ReactNode` - Message content as React children
- `text?: string` - Message content as a string (alternative to children)
- `className?: string` - Additional CSS classes

**Design Specifications:**
- **Background**: White (`--white`)
- **Shadow**: `0px 10px 40px 0px rgba(0, 0, 0, 0.03)`
- **Border radius**: 16px on bottom-left, top-left, top-right (rounded-bl, rounded-tl, rounded-tr)
- **Padding**: 16px
- **Typography**: Nunito Sans Regular, 16px, line-height 24px, color `--grey-300` (#666666)
- **Alignment**: Right-aligned

### `Message_JeffBot`

A message bubble component for JeffBot messages. Displays with a grey-75 background and left alignment.

**Props:**
- `children?: React.ReactNode` - Message content as React children
- `text?: string` - Message content as a string (alternative to children)
- `className?: string` - Additional CSS classes

**Design Specifications:**
- **Background**: Grey-75 (`--grey-75` / #f1f1f1)
- **Shadow**: None
- **Border radius**: 16px on bottom-right, top-left, top-right (rounded-br, rounded-tl, rounded-tr)
- **Padding**: 16px
- **Typography**: Nunito Sans Regular, 16px, line-height 24px, color `--grey-300` (#666666)
- **Alignment**: Left-aligned

## Usage

```tsx
import { Message_User, Message_JeffBot } from './components';

// User message with text prop
<Message_User text="Product design is chill" />

// User message with children
<Message_User>
  Product design is chill
</Message_User>

// JeffBot message with text prop
<Message_JeffBot text="Product design isn't about making it pretty." />

// JeffBot message with children
<Message_JeffBot>
  Product design isn't about making it pretty.
</Message_JeffBot>

// With additional className
<Message_User 
  text="Hello!" 
  className="custom-message-class" 
/>
```

## Integration

These components are designed for use in:
- JeffBot sidebar conversation interface
- Chat message displays
- Any UI requiring message bubbles with distinct user/bot styling

Make sure to import the CSS files in your main stylesheet or component:

```tsx
import './components/Message_User.css';
import './components/Message_JeffBot.css';
```

