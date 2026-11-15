import React, { useEffect, useRef, useState } from 'react';
import {
    CameraController,
    EColorMapMode,
    EDrawMeshAs,
    EMeshPaletteMode,
    ETitlePosition,
    GradientColorPalette,
    HeatmapLegend,
    linearColorMapLerp,
    MouseWheelZoomModifier3D,
    NumericAxis3D,
    OrbitModifier3D,
    PixelPointMarker3D,
    ScatterRenderableSeries3D,
    SciChart3DSurface,
    SciChartJsNavyTheme,
    SciChartSurface,
    SurfaceMeshRenderableSeries3D,
    UniformGridDataSeries3D,
    Vector3,
    XyzDataSeries3D,
    zeroArray2D,
} from "scichart";
import { appTheme } from "./SciChartTheme";

// The app's Navy theme with a see-through background so the map blends into the page.
// Built as its own instance so the shared appTheme (used by the legend) is untouched.
const createTransparentTheme = () => {
    const theme = new SciChartJsNavyTheme();
    theme.sciChartBackground = "#00000000";
    theme.loadingAnimationBackground = "#00000000";
    return theme;
};

const SciChartMap = () => {
    const chartRootRef = useRef(null);
    const legendRootRef = useRef(null);
    const surfaceRef = useRef(null);
    const legendRef = useRef(null);
    const scatterSeriesRef = useRef(null);
    const surfaceSeriesRef = useRef(null);

    // Fixed display settings (the on-screen toggle toolbar was removed)
    const showPoints = true;
    const showSurface = true;
    const showValues = false;
    const showLegend = false;

    // Toggle series visibility when state changes
    useEffect(() => {
        if (scatterSeriesRef.current) {
            scatterSeriesRef.current.isVisible = showPoints;
        }
    }, [showPoints]);

    useEffect(() => {
        if (surfaceSeriesRef.current) {
            surfaceSeriesRef.current.isVisible = showSurface;
        }
    }, [showSurface]);

    useEffect(() => {
        if (surfaceRef.current) {
            const axisVisibility = showValues;
            surfaceRef.current.xAxis.drawLabels = axisVisibility;
            surfaceRef.current.yAxis.drawLabels = axisVisibility;
            surfaceRef.current.zAxis.drawLabels = axisVisibility;
            
            surfaceRef.current.xAxis.drawMajorTickLines = axisVisibility;
            surfaceRef.current.xAxis.drawMinorTickLines = axisVisibility;
            surfaceRef.current.yAxis.drawMajorTickLines = axisVisibility;
            surfaceRef.current.yAxis.drawMinorTickLines = axisVisibility;
            surfaceRef.current.zAxis.drawMajorTickLines = axisVisibility;
            surfaceRef.current.zAxis.drawMinorTickLines = axisVisibility;

            surfaceRef.current.xAxis.drawMajorGridLines = axisVisibility;
            surfaceRef.current.yAxis.drawMajorGridLines = axisVisibility;
            surfaceRef.current.zAxis.drawMajorGridLines = axisVisibility;

            surfaceRef.current.xAxis.drawAxisBands = axisVisibility;
            surfaceRef.current.yAxis.drawAxisBands = axisVisibility;
            surfaceRef.current.zAxis.drawAxisBands = axisVisibility;

            const titleColor = axisVisibility ? appTheme.ForegroundColor : "transparent";
            surfaceRef.current.xAxis.axisTitleStyle.color = titleColor;
            surfaceRef.current.yAxis.axisTitleStyle.color = titleColor;
            surfaceRef.current.zAxis.axisTitleStyle.color = titleColor;
        }
    }, [showValues]);

    // More aggressive logo hiding
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            [id^="scichart-canvas-container"] ~ a,
            [id^="scichart-canvas-container"] + a,
            canvas + a[href*="scichart"],
            a[href*="scichart"],
            .scichart__logo,
            div[style*="z-index: 1000"] > a {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
        
        const interval = setInterval(() => {
            if (chartRootRef.current) {
                const anchors = chartRootRef.current.querySelectorAll('a');
                anchors.forEach(a => {
                    if (a.href.includes('scichart') || a.innerText.toLowerCase().includes('scichart')) {
                        a.style.display = 'none';
                        if (a.parentElement) a.parentElement.style.display = 'none';
                    }
                });
            }
        }, 500);
        
        return () => {
            document.head.removeChild(style);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const initSciChart = async () => {
            if (!chartRootRef.current || !legendRootRef.current) return;

            // Load data from the server
            const dataFromServer = await getDataFromServer();
            if (isCancelled) return;

            // SciChart 6.x: one configure call covers both 2D and 3D engines.
            // WASM files are copied from node_modules/scichart/_wasm to public/scichart.
            SciChartSurface.configure({ wasmUrl: "/scichart/scichart.wasm" });

            // Create a SciChart3DSurface
            const { wasmContext, sciChart3DSurface } = await SciChart3DSurface.create(chartRootRef.current, {
                // Transparent chart background so the map blends into the page
                // Must be a real constructed theme instance: SciChart 6 rejects plain
                // objects / copies when constructing a surface directly
                theme: createTransparentTheme(),
            });
            surfaceRef.current = sciChart3DSurface;
            const world = dataFromServer.worldDimensions;
            sciChart3DSurface.worldDimensions = world;

            // Create and attach a camera to the 3D Viewport
            sciChart3DSurface.camera = new CameraController(wasmContext, {
                position: new Vector3(world.x * 0.9, 900, world.z * 0.95),
                target: new Vector3(0, world.y * 0.25, 0),
            });

            // Add an X,Y,Z axis to the viewport
            sciChart3DSurface.xAxis = new NumericAxis3D(wasmContext, { 
                axisTitle: "X Distance (Meters)",
                drawLabels: showValues,
                drawMajorTickLines: showValues,
                drawMinorTickLines: showValues,
                drawMajorGridLines: showValues,
                drawAxisBands: showValues,
                axisTitleStyle: { color: showValues ? appTheme.ForegroundColor : "transparent" }
            });
            sciChart3DSurface.yAxis = new NumericAxis3D(wasmContext, { 
                axisTitle: "Height (Meters)",
                drawLabels: showValues,
                drawMajorTickLines: showValues,
                drawMinorTickLines: showValues,
                drawMajorGridLines: showValues,
                drawAxisBands: showValues,
                axisTitleStyle: { color: showValues ? appTheme.ForegroundColor : "transparent" }
            });
            sciChart3DSurface.zAxis = new NumericAxis3D(wasmContext, { 
                axisTitle: "Z Distance (Meters)",
                drawLabels: showValues,
                drawMajorTickLines: showValues,
                drawMinorTickLines: showValues,
                drawMajorGridLines: showValues,
                drawAxisBands: showValues,
                axisTitleStyle: { color: showValues ? appTheme.ForegroundColor : "transparent" }
            });

            // Create a ScatterRenderableSeries3D and configure as a point cloud with 1px markers
            sciChart3DSurface.renderableSeries.add(
                new ScatterRenderableSeries3D(wasmContext, {
                    pointMarker: new PixelPointMarker3D(wasmContext),
                    dataSeries: new XyzDataSeries3D(wasmContext, {
                        xValues: dataFromServer.ascData.XValues,
                        yValues: dataFromServer.ascData.YValues,
                        zValues: dataFromServer.ascData.ZValues,
                        metadata: dataFromServer.meta,
                    }),
                    opacity: 1,
                    isVisible: showPoints,
                })
            );
            scatterSeriesRef.current = sciChart3DSurface.renderableSeries.get(0);

            // Also render the point-cloud data as a heightmap / topology map with contours
            sciChart3DSurface.renderableSeries.add(
                new SurfaceMeshRenderableSeries3D(wasmContext, {
                    dataSeries: new UniformGridDataSeries3D(wasmContext, {
                        xStart: 0,
                        xStep: dataFromServer.ascData.CellSize,
                        zStart: 0,
                        zStep: dataFromServer.ascData.CellSize,
                        yValues: dataFromServer.heightValues2D,
                    }),
                    minimum: dataFromServer.range.min,
                    maximum: dataFromServer.range.max,
                    drawSkirt: true,
                    opacity: 0.7,
                    meshColorPalette: new GradientColorPalette(wasmContext, {
                        gradientStops: [
                            { offset: 1, color: appTheme.VividPink },
                            { offset: 0.9, color: appTheme.VividOrange },
                            { offset: 0.7, color: appTheme.MutedRed },
                            { offset: 0.5, color: appTheme.VividGreen },
                            { offset: 0.3, color: appTheme.VividSkyBlue },
                            { offset: 0.2, color: appTheme.Indigo },
                            { offset: 0, color: appTheme.DarkIndigo },
                        ],
                    }),
                    contourStroke: appTheme.PaleSkyBlue,
                    meshPaletteMode: EMeshPaletteMode.HEIGHT_MAP_INTERPOLATED,
                    contourStrokeThickness: 2,
                    drawMeshAs: EDrawMeshAs.SOLID_WITH_CONTOURS,
                    isVisible: showSurface,
                })
            );
            surfaceSeriesRef.current = sciChart3DSurface.renderableSeries.get(1);

            // Add interactivity modifiers for orbiting and zooming with the mousewheel
            sciChart3DSurface.chartModifiers.add(new MouseWheelZoomModifier3D());
            sciChart3DSurface.chartModifiers.add(new OrbitModifier3D());

            // Initialize Legend
            const { heatmapLegend } = await HeatmapLegend.create(legendRootRef.current, {
                theme: {
                    ...appTheme.SciChartJsTheme,
                    sciChartBackground: appTheme.DarkIndigo + "BB",
                    loadingAnimationBackground: appTheme.DarkIndigo + "BB",
                },
                yAxisOptions: {
                    isInnerAxis: true,
                    labelStyle: {
                        fontSize: 12,
                        color: appTheme.ForegroundColor,
                    },
                    axisBorder: {
                        borderRight: 1,
                        color: appTheme.ForegroundColor + "77",
                    },
                    majorTickLineStyle: {
                        color: appTheme.ForegroundColor,
                        tickSize: 6,
                        strokeThickness: 1,
                    },
                    minorTickLineStyle: {
                        color: appTheme.ForegroundColor,
                        tickSize: 3,
                        strokeThickness: 1,
                    },
                },
                colorMap: {
                    minimum: dataFromServer.range.min,
                    maximum: dataFromServer.range.max,
                    gradientStops: [
                        { offset: 1, color: appTheme.VividPink },
                        { offset: 0.9, color: appTheme.VividOrange },
                        { offset: 0.7, color: appTheme.MutedRed },
                        { offset: 0.5, color: appTheme.VividGreen },
                        { offset: 0.3, color: appTheme.VividSkyBlue },
                        { offset: 0.2, color: appTheme.Indigo },
                        { offset: 0, color: appTheme.DarkIndigo },
                    ],
                },
            });
            legendRef.current = heatmapLegend;
            heatmapLegend.innerSciChartSurface.sciChartSurface.title = "Height (m)";
            heatmapLegend.innerSciChartSurface.sciChartSurface.titleStyle = {
                fontSize: 12,
                color: appTheme.ForegroundColor,
                position: ETitlePosition.Bottom,
            };
        };

        // Loads the world heightmap generated by scripts/convertPointcloud.mjs:
        //   world-heightmap.json  grid size, cell size (m), height range
        //   world-heightmap.bin   Float32 heights in meters, row-major, NaN = no data
        const getDataFromServer = async () => {
            const [meta, binBuffer, pointsBuffer] = await Promise.all([
                fetch('/data/world-heightmap.json').then((r) => r.json()),
                fetch('/data/world-heightmap.bin').then((r) => r.arrayBuffer()),
                fetch('/data/world-points.bin').then((r) => r.arrayBuffer()),
            ]);
            const grid = new Float32Array(binBuffer);
            const { cols, rows, cellSize, colorMin, colorMax, pointCount } = meta;

            const colorMap = {
                Minimum: colorMin,
                Maximum: colorMax,
                Mode: EColorMapMode.Interpolated,
                GradientStops: [
                    { color: appTheme.DarkIndigo, offset: 0 },
                    { color: appTheme.Indigo, offset: 0.2 },
                    { color: appTheme.VividSkyBlue, offset: 0.3 },
                    { color: appTheme.VividGreen, offset: 0.5 },
                    { color: appTheme.MutedRed, offset: 0.7 },
                    { color: appTheme.VividOrange, offset: 0.9 },
                    { color: appTheme.VividPink, offset: 1 },
                ],
            };

            // Surface: top-height grid, NaN where there is no data
            const heightValues2D = zeroArray2D([rows, cols]);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    heightValues2D[r][c] = grid[r * cols + c];
                }
            }

            // Scatter: every real point (terrain, cliffs, overhangs).
            // Layout: [cols u16 x n][rows u16 x n][heights f32 x n]
            const ptCols = new Uint16Array(pointsBuffer, 0, pointCount);
            const ptRows = new Uint16Array(pointsBuffer, pointCount * 2, pointCount);
            const ptHeights = new Float32Array(pointsBuffer, pointCount * 4, pointCount);
            const XValues = new Float64Array(pointCount);
            const YValues = new Float64Array(pointCount);
            const ZValues = new Float64Array(pointCount);
            const pointMeta = new Array(pointCount);
            for (let i = 0; i < pointCount; i++) {
                XValues[i] = ptCols[i] * cellSize;
                YValues[i] = ptHeights[i];
                ZValues[i] = ptRows[i] * cellSize;
                pointMeta[i] = { vertexColor: linearColorMapLerp(colorMap, ptHeights[i]), pointScale: 0 };
            }

            return {
                ascData: { XValues, YValues, ZValues, CellSize: cellSize },
                meta: pointMeta,
                heightValues2D,
                range: { min: colorMin, max: colorMax },
                // 3D world sized to the real footprint (X fixed at 1000 units) with
                // 1.5x vertical exaggeration so the relief reads clearly
                worldDimensions: new Vector3(
                    1000,
                    Math.min(400, (1000 * (meta.maxHeight - meta.minHeight) * 1.5) / (cols * cellSize)),
                    (1000 * rows) / cols,
                ),
            };
        };

        initSciChart();

        return () => {
            isCancelled = true;
            if (surfaceRef.current) surfaceRef.current.delete();
            if (legendRef.current) legendRef.current.delete();
        };
    }, []);

    return (
        <div
            style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent', borderRadius: '12px', overflow: 'hidden' }}
        >
            <div ref={chartRootRef} style={{ width: '100%', height: '100%' }} />

            <div 
                ref={legendRootRef} 
                style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    width: '80px', 
                    top: '0px', 
                    right: '0px', 
                    background: 'rgba(14, 14, 22, 0.4)',
                    display: showLegend ? 'block' : 'none',
                    transition: 'opacity 0.3s ease'
                }} 
            />
        </div>
    );
};

export default SciChartMap;
