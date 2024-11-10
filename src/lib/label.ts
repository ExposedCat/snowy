import Clutter from 'gi://Clutter'
import St from 'gi://St'

export type EaseLabelArgs = {
	y: number
	x: number
	rotation_angle_z: number
	duration: number
	mode: Clutter.AnimationMode
	onComplete: () => void
}
