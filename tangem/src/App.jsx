import { useState, useRef, useEffect } from "react";
import image1 from "./assets/meo_nam-removebg-preview.png";
import image2 from "./assets/meo_nu-removebg-preview.png";
import Gif from "./assets/kiss-cute.gif";

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [showCat, setShowCat] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // State để kiểm tra thiết bị di động
  const [position, setPosition] = useState({ x: -300, y: -200 }); // Vị trí ban đầu

  const offset = useRef({ x: 0, y: 0 });
  const dragItem = useRef(null);
  const fixedCat = useRef(null);
  const animationFrameId = useRef(null);

  // Hàm kiểm tra thiết bị di động
  const checkIsMobile = () => {
    const mobileBreakpoint = 768; // Ngưỡng coi là thiết bị di động
    const isMobileDevice = window.innerWidth <= mobileBreakpoint;
    setIsMobile(isMobileDevice);
  };

  // Cập nhật vị trí của mèo nữ khi isMobile thay đổi
  useEffect(() => {
    if (isMobile) {
      setPosition({ x: -100, y: -180 }); // Vị trí cho thiết bị di động
    } else {
      setPosition({ x: -300, y: -200 }); // Vị trí cho màn hình lớn
    }
  }, [isMobile]);

  useEffect(() => {
    // Kiểm tra thiết bị di động khi tải trang và khi thay đổi kích thước cửa sổ
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;

    const newX = clientX - offset.current.x;
    const newY = clientY - offset.current.y;

    // Sử dụng requestAnimationFrame để cập nhật vị trí mượt mà
    animationFrameId.current = requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });

      if (fixedCat.current && dragItem.current) {
        const fixedRect = fixedCat.current.getBoundingClientRect();
        const dragRect = dragItem.current.getBoundingClientRect();

        // Thu hẹp vùng va chạm bằng cách giảm kích thước của fixedRect
        const collisionPadding = 50; // Điều chỉnh giá trị này để thu hẹp hoặc mở rộng vùng va chạm
        const collisionRect = {
          left: fixedRect.left + collisionPadding,
          right: fixedRect.right - collisionPadding,
          top: fixedRect.top + collisionPadding,
          bottom: fixedRect.bottom - collisionPadding,
        };

        const isOverlapping =
          dragRect.left < collisionRect.right &&
          dragRect.right > collisionRect.left &&
          dragRect.top < collisionRect.bottom &&
          dragRect.bottom > collisionRect.top;

        if (isOverlapping) {
          setIsColliding(true);
          setShowCat(false);
        } else {
          setIsColliding(false);
          setShowCat(true);
        }
      }
    });
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    offset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4">
      <div
        className={`h-full w-full ${
          isMobile ? "max-w-[500px] max-h-[800px]" : "max-w-[800px] max-h-[600px]"
        } relative bg-pink-100 flex items-center justify-center rounded-xl shadow-xl shadow-pink-300`}
      >
        <button
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-600 active:bg-pink-700 transition-colors duration-200"
          onClick={() => {
            setPosition(isMobile ? { x: -100, y: -180 } : { x: -300, y: -200 });
            setIsColliding(false);
            setShowCat(true);
            setIsDragging(false);
          }}
        >
          Reset
        </button>
          {/*  */}
        {/* Mèo nam (cố định) */}
        <div ref={fixedCat} className="absolute flex flex-col justify-center items-center">
          <h1 className="text-pink-500 text-2xl md:text-3xl font-bold text-center">
            Kéo vào đi bé....
          </h1>
          <img
            src={isColliding ? Gif : image1}
            alt="meoNam"
            className={`${
              isMobile ? "w-[120px] h-[120px]" : "w-[150px] h-[150px]"
            }`}
          />
        </div>

        {/* Mèo nữ (kéo được) */}
        <div
          ref={dragItem}
          className="absolute cursor-grab"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            visibility: showCat ? "visible" : "hidden",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            src={image2}
            alt="meoNu"
            className={`${isMobile ? "w-[170px]" : "w-[250px]"}`}
          />
        </div>
      </div>
    </div>
  );
}

export default App;