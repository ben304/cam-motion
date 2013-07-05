$ = KISSY.all
FPS = 1000 / 30

WIDTH = 640 #100
HEIGHT = 480 # 75

SENS = 40



$('canvas').add('#vi').attr
  width   : WIDTH
  height  : HEIGHT

vi = $('#vi')[0]
cv1 = $('#cv1')[0].getContext('2d')
cv2 = $('#cv2')[0].getContext('2d')
cv3 = $('#cv3')[0].getContext('2d')
cv4 = $('#cv4')[0].getContext('2d')

# worker = new Worker "worker.js"
# worker.onerror = -> console.log "worker error"
# worker.onmessage = (ev)-> console.log ev
# worker.postMessage "hello world!"


# copyPixel= (imageData, srcData, dest, src)->
#   # data = imageData.data
#   for i in [0 ... 3]
#     imageData.data[dest * 4 + i] = srcData[src * 4 + i]


# horiFlip = (imageData)->
#   width = imageData.width
#   height = imageData.height
#   data = imageData.data
#   # origin = KISSY.clone data
#   tmp_line = []
#   for pos in [0 ... width * height]
#     # 相对于目标图
#     line = Math.floor(pos / width)
#     dest_x = pos % width
#     tmp_line = [] if dest_x is 0
#     dest = line * width + (width - dest_x - 1)
#     dest_line = width - dest_x - 1
#     for i in [0 ... 4]
#       # 继续相对目标图而言
#       if dest_x < width / 2
#         # 记录原图每行前一半像素
#         tmp_line.push data[pos * 4 + i]

#         # 如果小于一半，从 data 读取
#         imageData.data[pos * 4 + i] = imageData.data[dest * 4 + i]
#         # imageData.data[dest * 4 + i] = data[pos * 4 + i]
#       else
#         # 从 tmp_line 读取
#         imageData.data[pos  4 + i] = tmp_line[dest_line * 4 + i]

    # if dest_x > width / 2
    #   console.log dest_x
    #copyPixel imageData, origin, pos, dest

drawArea = (area)->
  return if !area or !area.length
  imageData = cv3.createImageData WIDTH, HEIGHT
  for pos in area
    # Green
    imageData.data[pos*4 + 1] = 255
    imageData.data[pos*4 + 3] = 255
  cv3.putImageData imageData, 0, 0

calPos = (poses, width, height)->
  areas = []
  maxLen = 0
  maxLenIndex = 0
  # for i in [0 ... width * height]
  #   if i is poses[index]
  #     index++
  #     a1 = 
  for pos in poses
    # 判断 i 的四个临近点是否已经存在于已有区域
    #    a1
    # a3  x a2
    #    a4
    line = Math.floor pos / width
    x = pos % width
    a = []
    a.push (line - 1) * width + x if line != 0
    a.push pos + 1 if x != width - 1
    a.push (line + 1) * width + x if line != height - 1
    a.push pos - 1 if x != 0
    # a1 = line - 1 + x
    # a2 = pos + 1
    # a3 = line + 1 + x
    # a4 = pos - 1
    bo = false
    for area, index in areas
      bo = area.some (key)-> a.indexOf(key) != -1
      if bo
        # 如果存在，将此点放入此区域
        areas[index].push pos
        # 存储最大值
        if area.length > maxLen
          maxLen = area.length
          maxLenIndex = index
        break;
        # 不过不在，新建一个区域，把此点放入
    if !bo 
      areas.push [pos]

  drawArea areas[maxLenIndex]
  # console.log areas




filter = (imageData, color)->
  width = imageData.width
  height = imageData.height
  data = imageData.data
  tmp = []
  for pos in [0 ... width * height]
    pixel = pos * 4
    # bo = color.every (unit, key)->
    #   data[pixel + key] <= color[key] + 60 && data[pixel + key] >= color[key] - 60
    bo = false
    for key in [0...3]
      if !bo = data[pixel + key] <= color[key] + SENS && data[pixel + key] >= color[key] - SENS
        break
    if bo
      # 采样计算，否则很慢，前提是采样不影响连通块判断
      tmp.push pos # if Math.random() > 0.2
    else
      imageData.data[pixel + 3] = 0
  # calPos tmp, width, height
    #   # for key in [0...3]
    #   #   imageData.data[pixel + key] = 255
      # imageData.data[pixel + 3] = 0


dealWithFrame = (imageData)->
  time1 = new Date().getTime()
 
  # horiFlip imageData

  filter imageData, [124, 111, 113]
# 
  time2 = new Date().getTime()
  cv2.putImageData imageData, 0, 0
  console.log time2 - time1



navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia

navigator.getUserMedia {video: true } , (stream)->

  vi.src = window.URL.createObjectURL stream
  # vi.addEventListener 'loadeddata', (e)->
    # 用 canvas 重绘图像
  # cv1.setTransform -1, 0, 0, 1, 0, 0
  # cv1.scale -1, 1
  setInterval ->
    # vi.addEventListener "timeupdate", ->
    cv1.drawImage vi, 0, 0, WIDTH, HEIGHT
    cv1.setTransform -1, 0, 0, 1, WIDTH, 0
    dealWithFrame cv1.getImageData(0,0,WIDTH,HEIGHT)
  , FPS


