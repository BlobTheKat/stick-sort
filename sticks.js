export const sticks = []
export let sortedSticks = sticks
export let t0 = 0

export function throwSticks(count = 0, len = .5, dev = 0.25){
	t0 = t
	sticks.length = 0
	let a = len-dev, step = dev*2/(count-1)
	const zoneBuf = (len+dev) * .5, zoneSize = 1-len-dev
	while(count--){
		sticks.push({
			r: random() * PI2, dr: random() * 2 - 1,
			done: false, length: a,
			x: random() * zoneSize + zoneBuf - .5, y: random() * zoneSize + zoneBuf,
			color: vec4(random() * .5 + .4, random() * .5 + .4, random() * .5 + .4, 1)
		})
		a += step
	}
	sortedSticks = sticks.slice()
	sticks.sort((a, b) => a.dr - b.dr)
}