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
    SciChartSurface,
    SurfaceMeshRenderableSeries3D,
    UniformGridDataSeries3D,
    Vector3,
    XyzDataSeries3D,
    zeroArray2D,
} from "scichart";
import { AscReader } from "./AscReader";
import { appTheme } from "./SciChartTheme";
import { fetchLidarData } from "./ExampleDataProvider";

const SciChartMap = () => {
    const chartRootRef = useRef(null);
    const legendRootRef = useRef(null);
    const surfaceRef = useRef(null);
    const legendRef = useRef(null);
    const scatterSeriesRef = useRef(null);
    const surfaceSeriesRef = useRef(null);

    const [showPoints, setShowPoints] = useState(true);
    const [showSurface, setShowSurface] = useState(true);
    const [showValues, setShowValues] = useState(true);
    const [showLegend, setShowLegend] = useState(true);

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

            // Configure to use local WASM files from public folder (SciChart 5.x API)
            SciChartSurface.configure({ wasmUrl: "/scichart2d.wasm" });
            SciChart3DSurface.configure({ wasmUrl: "/scichart3d.wasm" });

            // Create a SciChart3DSurface
            const { wasmContext, sciChart3DSurface } = await SciChart3DSurface.create(chartRootRef.current, {
                theme: appTheme.SciChartJsTheme,
            });
            surfaceRef.current = sciChart3DSurface;
            sciChart3DSurface.worldDimensions = new Vector3(1000, 200, 1000);

            // Create and attach a camera to the 3D Viewport
            sciChart3DSurface.camera = new CameraController(wasmContext, {
                position: new Vector3(800, 1000, 800),
                target: new Vector3(0, 50, 0),
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
                    minimum: 0,
                    maximum: 50,
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
                    minimum: 0,
                    maximum: 50,
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

        const getDataFromServer = async () => {
            const colorMap = {
                Minimum: 0,
                Maximum: 50,
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

            const reader = new AscReader((height) => {
                return linearColorMapLerp(colorMap, height);
            });

            const rawData = await fetchLidarData();
            const ascData = reader.parse(await rawData.text());

            const meta = ascData.ColorValues.map((c) => ({
                vertexColor: c,
                pointScale: 0,
            }));

            const heightValues2D = zeroArray2D([ascData.NumberRows, ascData.NumberColumns]);
            for (let index = 0, z = 0; z < ascData.NumberRows; z++) {
                for (let x = 0; x < ascData.NumberColumns; x++) {
                    heightValues2D[z][x] = ascData.YValues[index++];
                }
            }

            return {
                ascData,
                meta,
                heightValues2D,
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
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0e0e16', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Control Toggles */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(0,0,0,0.5)',
                padding: '12px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />
                    Show Points
                </label>
                <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <input type="checkbox" checked={showSurface} onChange={(e) => setShowSurface(e.target.checked)} />
                    Show Surface
                </label>
                <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
                    Show Values
                </label>
                <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
                    Show Scale
                </label>
            </div>

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
