import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useUI } from '@/store/useUI';
import { activeCards } from '@/lib/cards';
import { EDGE_META, EDGE_TYPES } from '@/lib/constants';
import type { CardEdge, EdgeType } from '@/types';
import { CardNode, type CardNodeData } from '@/components/mindmap/CardNode';
import { EdgeEditor } from '@/components/mindmap/EdgeEditor';
import { EmptyState } from '@/components/common/EmptyState';

const nodeTypes = { card: CardNode };

function gridPos(i: number): { x: number; y: number } {
  return { x: (i % 4) * 240 + 40, y: Math.floor(i / 4) * 170 + 40 };
}

function toRFEdge(e: CardEdge): Edge {
  const meta = EDGE_META[e.type];
  return {
    id: e.id,
    source: e.sourceCardId,
    target: e.targetCardId,
    label: e.label || meta.label,
    animated: e.type === 'todo' || e.type === 'need',
    style: { stroke: meta.color, strokeWidth: 2 },
    labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.92 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
    markerEnd: { type: MarkerType.ArrowClosed, color: meta.color, width: 18, height: 18 },
  };
}

function MindmapInner() {
  const cards = useStore((s) => s.cards);
  const storeEdges = useStore((s) => s.edges);
  const setCardPosition = useStore((s) => s.setCardPosition);
  const addEdgeStore = useStore((s) => s.addEdge);
  const updateEdge = useStore((s) => s.updateEdge);
  const deleteEdge = useStore((s) => s.deleteEdge);
  const openEditCard = useUI((s) => s.openEditCard);
  const openNewCard = useUI((s) => s.openNewCard);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [pendingType, setPendingType] = useState<EdgeType>('relation');
  const [editingEdge, setEditingEdge] = useState<CardEdge | null>(null);

  // ストアのカード → ノード（位置と内部状態は保持）
  // 既存ノードは spread して残す。新しいオブジェクトに作り替えると React Flow が
  // 計測した handleBounds を失い、接続線が描画されなくなるため。
  useEffect(() => {
    const active = activeCards(cards);
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      return active.map((c, i) => {
        const existing = prevMap.get(c.id);
        if (existing) {
          return {
            ...existing,
            position: c.position ?? existing.position,
            data: { card: c } as CardNodeData,
          };
        }
        return {
          id: c.id,
          type: 'card',
          position: c.position ?? gridPos(i),
          data: { card: c } as CardNodeData,
        } as Node;
      });
    });
  }, [cards, setNodes]);

  // ストアの接続線 → エッジ
  useEffect(() => {
    setEdges(storeEdges.map(toRFEdge));
  }, [storeEdges, setEdges]);

  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source && c.target) {
        addEdgeStore(c.source, c.target, pendingType);
      }
    },
    [addEdgeStore, pendingType],
  );

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      setCardPosition(node.id, { x: node.position.x, y: node.position.y });
    },
    [setCardPosition],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const card = (node.data as CardNodeData).card;
      if (card) openEditCard(card);
    },
    [openEditCard],
  );

  const onEdgeClick = useCallback(
    (_: unknown, edge: Edge) => {
      const found = storeEdges.find((e) => e.id === edge.id);
      if (found) setEditingEdge(found);
    },
    [storeEdges],
  );

  const hasCards = activeCards(cards).length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] sm:h-[calc(100vh-7rem)]">
      <div className="mb-3 shrink-0">
        <h1 className="text-2xl font-bold">マインドマップ</h1>
        <p className="text-sm text-ink-faint mt-1 flex items-center gap-1">
          <Info size={14} /> 下の◯から線を引くとつながります。種類は下のボタンで選べます。
        </p>
      </div>

      {/* 接続線の種類セレクタ */}
      <div className="shrink-0 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex items-center gap-2 w-max">
          <span className="text-xs text-ink-faint shrink-0">線の種類:</span>
          {EDGE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setPendingType(t)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition ${
                pendingType === t
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-slate-200 text-ink-soft bg-surface'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: EDGE_META[t].color }}
              />
              {EDGE_META[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-slate-200 bg-surface">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          deleteKeyCode={null}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            className="!hidden sm:!block"
            nodeColor="#c7d2fe"
            maskColor="rgba(241,245,249,0.6)"
          />
        </ReactFlow>

        {!hasCards && (
          <div className="absolute inset-0 grid place-items-center bg-surface/60 backdrop-blur-[1px]">
            <EmptyState
              emoji="🕸️"
              title="つなげるカードがありません"
              description="まずはカードをいくつか作ってから、関係を線でつないでみましょう。"
              action={
                <button
                  className="btn-primary px-5 py-2.5"
                  onClick={() => openNewCard()}
                >
                  <Plus size={18} /> カードを追加
                </button>
              }
            />
          </div>
        )}
      </div>

      <EdgeEditor
        edge={editingEdge}
        onClose={() => setEditingEdge(null)}
        onSave={updateEdge}
        onDelete={deleteEdge}
      />
    </div>
  );
}

export function MindmapPage() {
  return (
    <ReactFlowProvider>
      <MindmapInner />
    </ReactFlowProvider>
  );
}
