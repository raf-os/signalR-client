import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@/styles/index.css"
import AppRoot from "@/AppRoot";

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppRoot />
	</StrictMode>,
)
