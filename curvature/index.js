// create canvas
const canvas = document.getElementById('fullscreen')
const width = document.body.clientWidth
const height = document.body.clientHeight
const size = Math.min(width, height)
canvas.width = size
canvas.height = size

// initialize drive modes
const robot = new Robot(5, 5, Math.PI / 2, 2.25)
const CurvatureDrive = new Curvature(robot, 2)

// initialize controller state
let horizontal = 0
let vertical = 0

// initialize camera state
let centerX = 5
let centerY = 5

// initialize robot path
let path = [[5, 5], [5, 5]]

// calculate new camera center
const correctCenter = () => {
    // get offset
    const offsetX = Math.abs(robot.x - centerX)
    const offsetY = Math.abs(robot.y - centerY)

    // define max offset
    const maxOffsetX = 2
    const maxOffsetY = 2

    // compare offsets
    if (offsetX > maxOffsetX) {
        const dX = offsetX - maxOffsetX
        robot.x - centerX > 0 ? centerX += dX : centerX -= dX
    }
    if (offsetY > maxOffsetY) {
        const dY = offsetY - maxOffsetY
        robot.y - centerY > 0 ? centerY += dY : centerY -= dY      
    }
}

// drive mode callbacks
const curvature = (horizontal, vertical) => {
    const velocities = CurvatureDrive.set(
        vertical, horizontal,
        [robot.x, robot.y, (robot.theta) % (2 * Math.PI)]
    )
    robot.delta(velocities[0], velocities[1], 0.05)
}

// get context
const ctx = canvas.getContext('2d')
const two = new hulet.Cartesian(ctx, 10, 10)
const controller = new Controller(8, 2, 1, curvature)

const refresh = () => {
    // clear
    two.clear()

    // set camera to follow robot
    correctCenter()
    two.Camera.center = [centerX, centerY]

    // background
    two.stroke = false
    two.fillStyle = '#333'
    two.polygon([[0, 0], [0, 10], [10, 10], [10, 0]])

    // add grid
    two.lineWidth = 1
    two.grid(1, '#000')

    // add center dot
    two.fillStyle = '#fff'
    two.circle([5, 5], 0.3)

    // trace path
    two.strokeStyle = '#4c85'
    two.lineWidth = 5
    for (let i = 0; i < path.length - 1; i++) {
        two.segment(path[i], path[i + 1])
    }
    
    // robot
    robot.draw()

    // controller
    controller.draw(centerX, centerY)
}
refresh()

// controller state
let deltaVertical = false
let deltaHorizontal = false

// update
const update = () => {
    vertical += deltaVertical
    horizontal += deltaHorizontal
    if (vertical > 1) vertical = 1
    if (vertical < -1) vertical = -1
    if (horizontal > 1) horizontal = 1
    if (horizontal < -1) horizontal = -1
    controller.set(horizontal, vertical)
    refresh()
    setTimeout(update, 50)
}
update()

// path tracer
const trace = () => {
    path.push([robot.x, robot.y])
    if (path.length >= 1000) {
        path.shift()
    }
    setTimeout(trace, 500)
}
trace()

// event listeners
document.body.addEventListener('keyup', e => {
    if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
        deltaVertical = 0
    }if (e.key == 'ArrowLeft' || e.key == 'ArrowRight') {
        deltaHorizontal = 0
    }
})
document.body.addEventListener('keydown', e => {
    if (e.key == 'ArrowUp') {
        deltaVertical = 0.05
    } if (e.key == 'ArrowDown') {
        deltaVertical = -0.05
    } if (e.key == 'ArrowLeft') {
        deltaHorizontal = 0.05
    } if (e.key == 'ArrowRight') {
        deltaHorizontal = -0.05
    }
})
