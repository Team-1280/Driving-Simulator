// create canvas
const canvas = document.getElementById('fullscreen')
const width = document.body.clientWidth
const height = document.body.clientHeight
const size = Math.min(width, height)
canvas.width = size
canvas.height = size

// initialize drive modes
const robot = new Robot(5, 5, Math.PI / 2, 2.25)
const StandardDrive = new Standard(robot, 2)

// initialize joystick state
let magnitude = 0
let angle = Math.PI / 2

// initialize camera state
let centerX = 5
let centerY = 5

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
const standard = (magnitude, angle) => {
    const velocities = StandardDrive.set(
        magnitude, angle,
        [robot.x, robot.y, robot.theta]
    )
    robot.delta(velocities[0], velocities[1], 0.05)
}

// get context
const ctx = canvas.getContext('2d')
const two = new hulet.Cartesian(ctx, 10, 10)
const joystick = new Joystick(8, 2, 1.25, standard)

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
    
    // robot
    robot.draw()

    // joystick
    joystick.draw(centerX, centerY)
}
refresh()

// joystick controls
let move = false
const R = 1

// update
const update = () => {
    joystick.set(magnitude, angle)
    refresh()
    setTimeout(update, 50)
}
update()

// event listeners
canvas.addEventListener('mousedown', e => {
    const xpos = e.clientX - canvas.offsetLeft
    const ypos = e.clientY - canvas.offsetTop

    const X = joystick.x + centerX - 5
    const Y = joystick.y + centerY - 5

    const transformed = two.Camera.transform([X, Y])
    if (Math.hypot(xpos - transformed[0], ypos - transformed[1]) < 50) move = true
})
canvas.addEventListener('mouseup', () => {
    move = false
    magnitude = 0
    angle = 0
    joystick.reset()
    refresh()
})
canvas.addEventListener('mousemove', e => {
    if (!move) return
    
    let xpos = e.clientX - canvas.offsetLeft
    let ypos = e.clientY - canvas.offsetTop

    const transformed = two.Camera.invTransform([xpos, ypos])
    const X = joystick.x + centerX - 5
    const Y = joystick.y + centerY - 5
    
    const dX = transformed[0] - X
    const dY = transformed[1] - Y

    magnitude = Math.hypot(dX, dY)
    magnitude > R ? magnitude = R : null
    angle = Math.atan(dY / dX)
    dX < 0 ? angle += Math.PI : null
})
