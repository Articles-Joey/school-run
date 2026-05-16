import { useCallback, useEffect, useState } from "react"

// Key Guide
// https://www.toptal.com/developers/keycode

function actionByKey(key) {
	const keyActionMap = {
		KeyW: 'jump',
		KeyS: 'roll',
		KeyA: 'moveLeft',
		KeyD: 'moveRight',
		Space: 'jump',
		ShiftLeft: 'shift',
	}
	return keyActionMap[key]
}

export const useKeyboard = () => {
	const [actions, setActions] = useState({
		moveUp: false,
		moveDown: false,
		moveLeft: false,
		moveRight: false,
		drop: false,
		jump: false,
		shift: false,
		roll: false,
	})

	const handleKeyDown = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: true
				})
			})
		}
	}, [])

	const handleKeyUp = useCallback((e) => {
		const action = actionByKey(e.code)
		if (action) {
			setActions((prev) => {
				return ({
					...prev,
					[action]: false
				})
			})
		}
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [handleKeyDown, handleKeyUp])

	return actions
}