import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Button from './ContentScript/Button.tsx'
import './ContentScript/content.css'

const root = document.createElement("div");
root.id = "crx-root";
document.body.appendChild(root);

createRoot(root).render(
  <StrictMode>
    <Button />
  </StrictMode>,
)
