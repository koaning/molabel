import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import { useState, useRef } from "react";

const DEFAULT_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const Box = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });
  const color = annotation.color || "red";

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [
        { x: initialPoints[0].x + dx, y: initialPoints[0].y + dy },
        { x: initialPoints[1].x + dx, y: initialPoints[1].y + dy },
      ];
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (e, corner) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      let newPoints = [...initialPoints];
      if (corner.includes("left")) {
        newPoints[0] = { ...newPoints[0], x: initialPoints[0].x + dx };
      }
      if (corner.includes("top")) {
        newPoints[0] = { ...newPoints[0], y: initialPoints[0].y + dy };
      }
      if (corner.includes("right")) {
        newPoints[1] = { ...newPoints[1], x: initialPoints[1].x + dx };
      }
      if (corner.includes("bottom")) {
        newPoints[1] = { ...newPoints[1], y: initialPoints[1].y + dy };
      }
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const p1 = annotation.points[0];
  const p2 = annotation.points[1];

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p1.y} stroke={color} strokeWidth="3" />
        <line x1={p2.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth="3" />
        <line x1={p2.x} y1={p2.y} x2={p1.x} y2={p2.y} stroke={color} strokeWidth="3" />
        <line x1={p1.x} y1={p2.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth="3" />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={annotation.points[0].x}
            y={annotation.points[0].y}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill={color}
          />
          <text
            ref={textRef}
            x={annotation.points[0].x + 2}
            y={annotation.points[0].y + 14}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
      )}
      {isSelected && (
        <g>
          <rect x={annotation.points[0].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill={color} onMouseDown={(e) => handleResizeMouseDown(e, "top-left")} style={{ cursor: "nwse-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[0].y - 4} width="8" height="8" fill={color} onMouseDown={(e) => handleResizeMouseDown(e, "top-right")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[0].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill={color} onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")} style={{ cursor: "nesw-resize" }} />
          <rect x={annotation.points[1].x - 4} y={annotation.points[1].y - 4} width="8" height="8" fill={color} onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")} style={{ cursor: "nwse-resize" }} />
        </g>
      )}
    </g>
  );
};

const Point = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });
  const color = annotation.color || "red";

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoint = annotation.points[0];

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [{ x: initialPoint.x + dx, y: initialPoint.y + dy }];
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const p = annotation.points[0];

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <circle cx={p.x} cy={p.y} r={isSelected ? 6 : 4} fill={color} />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={p.x + 8}
            y={p.y - 8}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill={color}
          />
          <text
            ref={textRef}
            x={p.x + 10}
            y={p.y + 4}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
      )}
    </g>
  );
};

const Polygon = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });
  const color = annotation.color || "red";

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = initialPoints.map(point => ({
        x: point.x + dx,
        y: point.y + dy
      }));
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleVertexMouseDown = (e, vertexIndex) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [...initialPoints];
      newPoints[vertexIndex] = {
        x: initialPoints[vertexIndex].x + dx,
        y: initialPoints[vertexIndex].y + dy
      };
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const pathData = annotation.points.length > 0 
    ? `M ${annotation.points.map(p => `${p.x},${p.y}`).join(' L ')} Z`
    : '';

  const labelPosition = annotation.points.length > 0 ? annotation.points[0] : { x: 0, y: 0 };

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
        />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={labelPosition.x}
            y={labelPosition.y - 18}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill={color}
          />
          <text
            ref={textRef}
            x={labelPosition.x + 2}
            y={labelPosition.y - 4}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
      )}
      {isSelected && annotation.points.map((point, index) => (
        <rect
          key={index}
          x={point.x - 4}
          y={point.y - 4}
          width="8"
          height="8"
          fill={color}
          onMouseDown={(e) => handleVertexMouseDown(e, index)}
          style={{ cursor: "crosshair" }}
        />
      ))}
    </g>
  );
};


const Line = ({ annotation, isSelected, onSelect, onUpdate }) => {
  const textRef = useRef(null);
  const [textBBox, setTextBBox] = useState({ width: 0, height: 0 });
  const color = annotation.color || "red";

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setTextBBox({ width: bbox.width, height: bbox.height });
    }
  }, [annotation.label]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(annotation.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = initialPoints.map(point => ({
        x: point.x + dx,
        y: point.y + dy
      }));
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleVertexMouseDown = (e, vertexIndex) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialPoints = annotation.points;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const newPoints = [...initialPoints];
      newPoints[vertexIndex] = {
        x: initialPoints[vertexIndex].x + dx,
        y: initialPoints[vertexIndex].y + dy
      };
      onUpdate({ ...annotation, points: newPoints });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // remove `Z` so the both ends of the line is not closing
  const pathData = annotation.points.length > 0 
    ? `M ${annotation.points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const labelPosition = annotation.points.length > 0 ? annotation.points[0] : { x: 0, y: 0 };

  return (
    <g style={{ userSelect: 'none' }}>
      <g onMouseDown={handleMouseDown} style={{ cursor: "move" }}>
        <path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
        />
      </g>
      {annotation.label && (
        <g onMouseDown={(e) => { e.stopPropagation(); onSelect(annotation.id); }}>
          <rect
            x={labelPosition.x}
            y={labelPosition.y - 18}
            width={textBBox.width + 4}
            height={textBBox.height}
            fill={color}
          />
          <text
            ref={textRef}
            x={labelPosition.x + 2}
            y={labelPosition.y - 4}
            fill="white"
            fontSize="14"
            style={{ pointerEvents: "none" }}
          >
            {annotation.label}
          </text>
        </g>
      )}
      {isSelected && annotation.points.map((point, index) => (
        <rect
          key={index}
          x={point.x - 4}
          y={point.y - 4}
          width="8"
          height="8"
          fill={color}
          onMouseDown={(e) => handleVertexMouseDown(e, index)}
          style={{ cursor: "crosshair" }}
        />
      ))}
    </g>
  );
};

const DrawingArea = ({
  imageSrc,
  annotations,
  onAnnotationChange,
  tool,
  selectedShape,
  setSelectedShape,
  currentClass,
  drawingColor,
}) => {
  const [drawing, setDrawing] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [linePoints, setLinePoints] = useState([]);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const hasDragged = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const isDataURI = imageSrc?.startsWith('data:image/');
    setIsLoading(true);
    setImageError(null);

    // Handle base64 data URIs differently - they're immediately available
    if (isDataURI) {
      // Use a minimal timeout to ensure React has finished rendering
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 10);
      return () => clearTimeout(timer);
    }
    // For HTTP URLs, rely on the onLoad event (existing behavior)
  }, [imageSrc]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (tool === "polygon" && polygonPoints.length >= 3) {
        if (e.key === "Enter" || e.key === "Escape") {
          finishPolygon();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tool, polygonPoints, annotations, currentClass, imageDimensions]);

  React.useEffect(() => {
    // Clear polygon points when tool changes
    if (tool !== "polygon") {
      setPolygonPoints([]);
    }
  }, [tool]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (tool === "line") {
        if (e.key === "Enter" || e.key === "Escape") {
          finishLine();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [tool, linePoints, annotations, currentClass, imageDimensions]);

  React.useEffect(() => {
    // Clear line points when tool changes
    if (tool !== "line") {
      setLinePoints([]);
    }
  }, [tool]);
  function handleImageLoad() {
    setIsLoading(false);
    setImageError(null);
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  }

  function handleImageError(e) {
    setIsLoading(false);
    setImageError('Failed to load image');
  }

  function finishPolygon() {
    if (polygonPoints.length >= 3) {
      const newAnnotation = {
        id: Date.now().toString(),
        type: "polygon",
        label: currentClass,
        points: polygonPoints,
        imageDimensions: { width: imageDimensions.width, height: imageDimensions.height }
      };
      onAnnotationChange([...annotations, newAnnotation]);
      setSelectedShape(newAnnotation.id);
    }
    setPolygonPoints([]);
  }

  function finishLine() {
    if (linePoints.length >= 1) {
      const newAnnotation = {
        id: Date.now().toString(),
        type: "line",
        label: currentClass,
        points: linePoints,
        imageDimensions: { width: imageDimensions.width, height: imageDimensions.height }
      };
      onAnnotationChange([...annotations, newAnnotation]);
      setSelectedShape(newAnnotation.id);
    }
    setLinePoints([]);
  }
  function handleMouseDown(e) {
    if (e.target === containerRef.current || e.target.tagName === 'svg' || e.target.tagName === 'IMG') {
      setSelectedShape(null);
    }

    if (tool === "box") {
      hasDragged.current = false;
      const { x, y } = getCoordinates(e);
      const relCoords = absoluteToRelative(x, y);
      setDrawing({ startX: relCoords.x, startY: relCoords.y, endX: relCoords.x, endY: relCoords.y });
    } else if (tool === "point") {
      const { x, y } = getCoordinates(e);
      const relCoords = absoluteToRelative(x, y);
      const newAnnotation = {
        id: Date.now().toString(),
        type: "point",
        label: currentClass,
        points: [relCoords],
        imageDimensions: { width: imageDimensions.width, height: imageDimensions.height }
      };
      onAnnotationChange([...annotations, newAnnotation]);
      setSelectedShape(newAnnotation.id);
    } else if (tool === "line") {
      const { x, y } = getCoordinates(e);
      const relCoords = absoluteToRelative(x, y);
      setLinePoints([...linePoints, relCoords]);
    } else if (tool === "polygon") {
      const { x, y } = getCoordinates(e);
      const relCoords = absoluteToRelative(x, y);

      // Check if this is a double-click on the first point to close the polygon
      if (polygonPoints.length >= 3) {
        const firstPoint = polygonPoints[0];
        const absFirstPoint = relativeToAbsolute(firstPoint.x, firstPoint.y);
        const distance = Math.sqrt(Math.pow(x - absFirstPoint.x, 2) + Math.pow(y - absFirstPoint.y, 2));
        if (distance < 10) { // Close polygon if clicked near first point
          finishPolygon();
          return;
        }
      }

      setPolygonPoints([...polygonPoints, relCoords]);
    }
  }

  function handleMouseMove(e) {
    if (!drawing) return;
    hasDragged.current = true;
    const { x, y } = getCoordinates(e);
    const relCoords = absoluteToRelative(x, y);
    setDrawing({ ...drawing, endX: relCoords.x, endY: relCoords.y });
  }

  function handleMouseUp(e) {
    if (tool !== "box" || !drawing || !hasDragged.current) {
      setDrawing(null);
      return;
    }
    const { startX, startY, endX, endY } = drawing;
    const newAnnotation = {
      id: Date.now().toString(),
      type: "box",
      label: currentClass,
      points: [
        { x: Math.min(startX, endX), y: Math.min(startY, endY) },
        { x: Math.max(startX, endX), y: Math.max(startY, endY) },
      ],
      imageDimensions: { width: imageDimensions.width, height: imageDimensions.height }
    };
    onAnnotationChange([...annotations, newAnnotation]);
    setSelectedShape(newAnnotation.id);
    setDrawing(null);
  }

  function getCoordinates(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  function absoluteToRelative(absX, absY) {
    if (!imageRef.current) return { x: 0, y: 0 };
    const displayWidth = imageRef.current.offsetWidth;
    const displayHeight = imageRef.current.offsetHeight;
    return {
      x: absX / displayWidth,
      y: absY / displayHeight
    };
  }

  function relativeToAbsolute(relX, relY) {
    if (!imageRef.current) return { x: 0, y: 0 };
    const displayWidth = imageRef.current.offsetWidth;
    const displayHeight = imageRef.current.offsetHeight;
    return {
      x: relX * displayWidth,
      y: relY * displayHeight
    };
  }

  function convertAnnotationToRelative(annotation) {
    if (annotation.coordinateType === 'relative') {
      return annotation;
    }
    const points = annotation.points.map(p => absoluteToRelative(p.x, p.y));
    return { ...annotation, points, coordinateType: 'relative' };
  }

  function convertAnnotationToAbsolute(annotation) {
    if (annotation.coordinateType === 'absolute') {
      return annotation;
    }
    const points = annotation.points.map(p => relativeToAbsolute(p.x, p.y));
    return { ...annotation, points, coordinateType: 'absolute' };
  }
  
  function normalizeAnnotation(annotation) {
    let normalized = annotation;
    
    // Add coordinate type if missing
    if (!annotation.coordinateType) {
      const maxX = Math.max(...annotation.points.map(p => p.x));
      const maxY = Math.max(...annotation.points.map(p => p.y));
      if (maxX > 1 || maxY > 1) {
        normalized = { ...normalized, coordinateType: 'absolute' };
      } else {
        normalized = { ...normalized, coordinateType: 'relative' };
      }
    }
    
    // Add image dimensions if missing
    if (!normalized.imageDimensions && imageDimensions.width && imageDimensions.height) {
      normalized = { ...normalized, imageDimensions: { width: imageDimensions.width, height: imageDimensions.height } };
    }
    
    return normalized;
  }

  function handleUpdateAnnotation(updatedAnnotation) {
    const newAnnotations = annotations.map((anno) =>
      anno.id === updatedAnnotation.id ? updatedAnnotation : anno
    );
    onAnnotationChange(newAnnotations);
  }

  return (
    <div className="imagewidget-drawing-area">
      <div
        ref={containerRef}
        style={{ position: "relative", display: "inline-block" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isLoading && <div style={{ padding: '2rem', color: '#888' }}>Loading image...</div>}
        {imageError && <div style={{ padding: '2rem', color: '#ff4444' }}>Error: {imageError}</div>}
        <img 
          ref={imageRef}
          src={imageSrc} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: (isLoading || imageError) ? "none" : "block" }} 
        />
        {!isLoading && !imageError && (
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {annotations.map((anno) => {
              const normalizedAnno = normalizeAnnotation(anno);
              const absAnno = convertAnnotationToAbsolute(normalizedAnno);
              if (anno.type === "box") {
                return (
                  <Box
                    key={anno.id}
                    annotation={absAnno}
                    isSelected={selectedShape === anno.id}
                    onSelect={setSelectedShape}
                    onUpdate={(updated) => {
                      const relativeUpdated = convertAnnotationToRelative(updated);
                      handleUpdateAnnotation(relativeUpdated);
                    }}
                  />
                );
              }
              if (anno.type === "point") {
                return (
                  <Point
                    key={anno.id}
                    annotation={absAnno}
                    isSelected={selectedShape === anno.id}
                    onSelect={setSelectedShape}
                    onUpdate={(updated) => {
                      const relativeUpdated = convertAnnotationToRelative(updated);
                      handleUpdateAnnotation(relativeUpdated);
                    }}
                  />
                );
              }
              if (anno.type === "line") {
                return (
                  <Line
                    key={anno.id}
                    annotation={absAnno}
                    isSelected={selectedShape === anno.id}
                    onSelect={setSelectedShape}
                    onUpdate={(updated) => {
                      const relativeUpdated = convertAnnotationToRelative(updated);
                      handleUpdateAnnotation(relativeUpdated);
                    }}
                  />
                );
              }
              if (anno.type === "polygon") {
                return (
                  <Polygon
                    key={anno.id}
                    annotation={absAnno}
                    isSelected={selectedShape === anno.id}
                    onSelect={setSelectedShape}
                    onUpdate={(updated) => {
                      const relativeUpdated = convertAnnotationToRelative(updated);
                      handleUpdateAnnotation(relativeUpdated);
                    }}
                  />
                );
              }
              return null;
            })}
            {drawing && tool === "box" && (() => {
              const absStart = relativeToAbsolute(drawing.startX, drawing.startY);
              const absEnd = relativeToAbsolute(drawing.endX, drawing.endY);
              return (
                <rect
                  x={Math.min(absStart.x, absEnd.x)}
                  y={Math.min(absStart.y, absEnd.y)}
                  width={Math.abs(absStart.x - absEnd.x)}
                  height={Math.abs(absStart.y - absEnd.y)}
                  stroke={drawingColor}
                  fill="transparent"
                  strokeWidth="2"
                />
              );
            })()}
            {tool === "line" && linePoints.length > 0 && (() => {
              const absPoints = linePoints.map(p => relativeToAbsolute(p.x, p.y));
              if (absPoints.length === 1) {
                return (
                  <circle
                    cx={absPoints[0].x}
                    cy={absPoints[0].y}
                    r="4"
                    fill={drawingColor}
                  />
                );
              }
              const pathData = `M ${absPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
              return (
                <g>
                  <path
                    d={pathData}
                    stroke={drawingColor}
                    strokeWidth="2"
                    fill="transparent"
                  />
                  {absPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={drawingColor}
                    />
                  ))}
                  {linePoints.length >= 1 && (
                    <circle
                      cx={absPoints[0].x}
                      cy={absPoints[0].y}
                      r="8"
                      fill="transparent"
                      stroke={drawingColor}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  )}
                </g>
              );
            })()}
            {tool === "polygon" && polygonPoints.length > 0 && (() => {
              const absPoints = polygonPoints.map(p => relativeToAbsolute(p.x, p.y));
              if (absPoints.length === 1) {
                return (
                  <circle
                    cx={absPoints[0].x}
                    cy={absPoints[0].y}
                    r="4"
                    fill={drawingColor}
                  />
                );
              }
              const pathData = `M ${absPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
              return (
                <g>
                  <path
                    d={pathData}
                    stroke={drawingColor}
                    strokeWidth="2"
                    fill="transparent"
                  />
                  {absPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={drawingColor}
                    />
                  ))}
                  {polygonPoints.length >= 3 && (
                    <circle
                      cx={absPoints[0].x}
                      cy={absPoints[0].y}
                      r="8"
                      fill="transparent"
                      stroke={drawingColor}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  )}
                </g>
              );
            })()}
          </svg>
        )}
      </div>
    </div>
  );
};

const Toolbar = ({ tool, setTool, onClear, classes, currentClass, setCurrentClass, onDeleteSelected, selectedShape, onUndo, canUndo }) => {
  return (
    <div className="imagewidget-toolbar">
      {classes && classes.length > 0 && (
        <div className="imagewidget-classes">
          {classes.map((c) => (
            <button
              key={c}
              className={currentClass === c ? "selected" : ""}
              onClick={() => setCurrentClass(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="imagewidget-tools">
        <button onClick={() => setTool("box")} disabled={tool === "box"} title="Draw Box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        </button>
        <button onClick={() => setTool("point")} disabled={tool === "point"} title="Draw Point">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
        </button>
        <button onClick={() => setTool("polygon")} disabled={tool === "polygon"} title="Draw Polygon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"></polygon></svg>
        </button>
        <button onClick={() => setTool("line")} disabled={tool === "line"} title="Draw Line">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L22 8.5 L22 15.5 L12 22"></path></svg>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onUndo} disabled={!canUndo} title="Undo">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"></path><polyline points="19 12 5 12"></polyline></svg>
        </button>
        <button onClick={onClear} title="Clear All">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
        <button onClick={onDeleteSelected} disabled={!selectedShape} title="Delete Selected">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>
  );
};

const Navigation = ({ currentIndex, setCurrentIndex, srcs, annotations }) => {
  const currentSrc = srcs[currentIndex];
  const imageName = currentSrc.split("/").pop();
  const annotatedImagesCount = annotations.filter(a => a.elements && a.elements.length > 0).length;

  return (
    <div className="imagewidget-navigation">
      <button
        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        disabled={currentIndex === 0}
        title="Previous"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div className="imagewidget-progress-details">
        <span className="imagewidget-filename" title={imageName}>{imageName}</span>
        <div className="imagewidget-progress-container">
          <div className="imagewidget-progress-bar" style={{ width: `${(annotatedImagesCount / srcs.length) * 100}%` }} />
        </div>
        <span className="imagewidget-progress-text">
          {currentIndex + 1} / {srcs.length}
        </span>
      </div>
      <button
        onClick={() =>
          setCurrentIndex((i) => Math.min(srcs.length - 1, i + 1))
        }
        disabled={currentIndex === srcs.length - 1}
        title="Next"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>
  );
};

function ImageAnnotationWidget() {
  const [srcs] = useModelState("srcs");
  const [annotations, setAnnotations] = useModelState("annotations");
  const [classes] = useModelState("classes");
  const [colors] = useModelState("colors");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState("box");
  const [selectedShape, setSelectedShape] = useState(null);
  const [currentClass, setCurrentClass] = useState(
    classes && classes.length > 0 ? classes[0] : ""
  );

  React.useEffect(() => {
    if (classes && classes.length > 0) {
      setCurrentClass(classes[0]);
    }
  }, [classes]);

  const labelColorMap = {};
  if (colors && Object.keys(colors).length > 0) {
    Object.assign(labelColorMap, colors);
  }

  if (!srcs || srcs.length === 0) {
    return <div>Loading images...</div>;
  }

  const currentSrc = srcs[currentIndex];
  const currentAnnotationData = annotations.find((a) => a.src === currentSrc) || {
    elements: [],
  };

  function handleAnnotationChange(newElements) {
    const newAnnotations = annotations.map((anno) => {
      if (anno.src === currentSrc) {
        const updatedElements = newElements.map((el, index) => {
          if (el.color) return el;
          let color;
          if (Object.keys(labelColorMap).length > 0) {
            color = labelColorMap[el.label];
          } else {
            color = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          }
          return { ...el, color: color || "red" };
        });
        return { ...anno, elements: updatedElements };
      }
      return anno;
    });
    setAnnotations(newAnnotations);
  }

  function handleClear() {
    handleAnnotationChange([]);
  }

  function handleDeleteSelected() {
    if (!selectedShape) return;
    const newElements = currentAnnotationData.elements.filter(
      (el) => el.id !== selectedShape
    );
    handleAnnotationChange(newElements);
    setSelectedShape(null);
  }

  function handleUndo() {
    if (currentAnnotationData.elements.length === 0) return;
    const newElements = currentAnnotationData.elements.slice(0, -1);
    const removedAnnotation = currentAnnotationData.elements[currentAnnotationData.elements.length - 1];
    handleAnnotationChange(newElements);
    if (selectedShape === removedAnnotation.id) {
      setSelectedShape(null);
    }
  }

  const drawingColor = Object.keys(labelColorMap).length > 0
    ? labelColorMap[currentClass]
    : DEFAULT_COLORS[currentAnnotationData.elements.length % DEFAULT_COLORS.length];

  return (
    <div className="imagewidget-container">
      <Toolbar
        tool={tool}
        setTool={setTool}
        onClear={handleClear}
        classes={classes}
        currentClass={currentClass}
        setCurrentClass={setCurrentClass}
        onDeleteSelected={handleDeleteSelected}
        selectedShape={selectedShape}
        onUndo={handleUndo}
        canUndo={currentAnnotationData.elements.length > 0}
      />
      <DrawingArea
        imageSrc={currentSrc}
        annotations={currentAnnotationData.elements}
        onAnnotationChange={handleAnnotationChange}
        tool={tool}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        currentClass={currentClass}
        drawingColor={drawingColor}
      />
      <Navigation
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        srcs={srcs}
        annotations={annotations}
      />
    </div>
  );
}

const render = createRender(ImageAnnotationWidget);
export default { render };
