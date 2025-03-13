"use client";

import React from 'react'

const DemoVideo = () => {
  return (
    <div className="flex m-2 mt-28 max-w-[560px] max-h-[315px] w-[90vw] mx-auto">
          <img
            src="https://ik.imagekit.io/pexinxas/demo%20thumbnail.png?updatedAt=1716573109621"
            alt=""
            id="demo-thumbnail"
            onClick={() => {
              const demoImg: any = document.querySelector("#demo-thumbnail")
              const demoVideo: any = document.querySelector("#demo-video")
              demoVideo.style.display = "block"
              demoImg.style.display = "none"
            }}
          />
          <video className="hidden" muted autoPlay loop id="demo-video">
            <source
              src="https://ik.imagekit.io/pexinxas/pexinxas-demo.mp4?updatedAt=1715274365785"
              type="video/mp4"
            />
          </video>
        </div>
  )
}

export default DemoVideo