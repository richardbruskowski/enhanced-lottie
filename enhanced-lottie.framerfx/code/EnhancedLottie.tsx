import * as React from 'react'
import { useState, useEffect } from 'react'
import {
	Frame,
	useCycle,
	addPropertyControls,
	ControlType,
} from 'framer'
import { url } from 'framer/resource'
//@ts-ignore
import Lottie from './Lottie'

export function EnhancedLottie({
	lottieJsonURL,
	speed,
	percentage,
	playState,
	direction,
	loop,
	segmentStart,
	segmentEnd,
	playSegments,
	onComplete = () => void 0,
	onLoopComplete = () => void 0,
	onEnterFrame = () => void 0,
	onSegmentStart = () => void 0,
	...props
}) {
	const [animationData, setAnimationData] = useState(null)
	const [isStopped, setIsStopped] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [error, setError] = useState(false)

	const loadLottieData = () => {
		fetch(decodeURIComponent(url(lottieJsonURL)), {
			method: 'GET',
			credentials: 'omit',
			redirect: 'follow',
		})
			.then(resp => {
				if (!resp.ok) {
					console.error(
						'There was an error while the fetching Lottie JSON URL'
					)
					console.log(
						'Printing failed response...'
					)
					console.log(resp)

					setError(true)
					return
				}
				resp.json()
					.then(data => {
						setError(true)
						setAnimationData(data)
					})
					.catch(e => {
						console.error(e)
						console.log(
							'Could not parse a valid JSON from the Lottie URL'
						)
						setError(true)
					})
			})
			.catch(e => {
				setError(true)

				console.error(e)
			})
	}

	useEffect(() => {
		loadLottieData()
	}, [lottieJsonURL, loop])

	useEffect(() => {
		if (playState == 'pause') setIsPaused(true)
		else if (playState == 'stop') setIsStopped(true)
		else if (playState == 'play') {
			setIsPaused(false)
			setIsStopped(false)
		}
	}, [playState])

	let defaultOptions = {
		animationData: animationData,
		loop: loop,
		rendererSettings: {
			preserveAspectRatio: 'xMidYMid slice',
		},
	}

	return (
		<Frame
			width="100%"
			height="100%"
			background=""
			{...props}
		>
			<Lottie
				options={defaultOptions}
				isStopped={isStopped}
				isPaused={isPaused}
				speed={speed}
				direction={direction == 'normal' ? 1 : -1}
				percentage={percentage / 100}
				segments={[segmentStart, segmentEnd]}
				playSegments={playSegments}
				eventListeners={[
					{
						eventName: 'complete',
						callback: onComplete,
					},
					{
						eventName: 'loopComplete',
						callback: onLoopComplete,
					},
					{
						eventName: 'enterFrame',
						callback: onEnterFrame,
					},
					{
						eventName: 'segmentStart',
						callback: onSegmentStart,
					},
				]}
			/>
		</Frame>
	)
}

EnhancedLottie.defaultProps = {
	lottieJsonURL: url('/assets/check-animation.json'),
}

addPropertyControls(EnhancedLottie, {
	lottieJsonURL: {
		type: ControlType.File,
		title: 'File',
		allowedFileTypes: ['json'],
	},
	playState: {
		type: ControlType.SegmentedEnum,
		title: 'State',
		defaultValue: 'play',
		options: ['play', 'pause', 'stop'],
		optionTitles: ['▶', '❙❙', '■'],
	},
	percentage: {
		type: ControlType.Number,
		defaultValue: 0,
		min: 0,
		max: 100,
		step: 0.1,
		unit: '%',
		displayStepper: false,
		title: 'Position',
		hidden(props) {
			return props.playState !== 'stop'
		},
	},
	speed: {
		type: ControlType.Number,
		defaultValue: 1,
		min: 0,
		max: 10,
		step: 0.1,
		displayStepper: false,
		title: 'Speed',
	},
	direction: {
		title: 'Direction',
		type: ControlType.SegmentedEnum,
		defaultValue: 'normal',
		options: ['normal', 'reverse'],
		optionTitles: ['Normal', 'Reverse'],
	},

	loop: {
		type: ControlType.Boolean,
		title: 'Loop',
		defaultValue: true,
	},
	playSegments: {
		type: ControlType.Boolean,
		title: 'Segment',
		defaultValue: false,
	},
	segmentStart: {
		type: ControlType.Number,
		min: 0,
		max: 1000,
		step: 1,
		title: '↦ Start',
		hidden(props) {
			return props.playSegments === false
		},
		defaultValue: 0,
	},
	segmentEnd: {
		type: ControlType.Number,
		min: 0,
		max: 1000,
		step: 1,
		title: '⇥ End',
		hidden(props) {
			return props.playSegments === false
		},
		defaultValue: 100,
	},
	// segments: {
	//     title: "Segments",
	//     type: ControlType.Array,
	//     propertyControl: {
	//         type: ControlType.Number,
	//         min: 0,
	//         max: 1000,
	//         step: 1,
	//     },
	//     hidden(props) {
	//         return props.playSegments === false
	//     },
	//     maxCount: 2,
	//     defaultValue: [0, 100],
	// },
})
