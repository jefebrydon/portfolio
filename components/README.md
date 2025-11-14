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

