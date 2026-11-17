import {useState} from 'react';
import {request} from '../api/http';
import {usePollingResource} from '../hooks/usePollingResource';

export default function KafkaComponent() {
  const topics = usePollingResource('/api/kafka/topics');
  const cluster = usePollingResource('/api/kafka/cluster');
  const groups = usePollingResource('/api/kafka/groups');
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [topic, setTopic] = useState(null), [config, setConfig] = useState(null);
  const [group, setGroup] = useState(null);
  const [create, setCreate] = useState({name: 'demo.prueba', partitions: 3, replicationFactor: 3, days: 7, cleanupPolicy: 'delete'});
  const [change, setChange] = useState({partitions: 3, days: 7, cleanupPolicy: 'delete'});
  const [offset, setOffset] = useState({topic: 'orders.events', partition: 0, offset: 0});
  async function action(work, message) {
    setBusy(true); setError(''); setNotice('');
    try { await work(); setNotice(message); topics.reload(); groups.reload(); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function inspect(row) {
    setBusy(true); setError('');
    try {
      const value = await request('/api/kafka/topics/' + encodeURIComponent(row.name) + '/config');
      setTopic(row); setConfig(value);
      setChange({partitions: row.partitions, days: Number(value['retention.ms']) / 86400000, cleanupPolicy: value['cleanup.policy']});
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  async function inspectGroup(id) {
    setBusy(true); setError('');
    try { setGroup(await request('/api/kafka/groups/' + encodeURIComponent(id))); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  function updateCreate(event) { setCreate(value => ({...value, [event.target.name]: event.target.value})); }
  return <div>
    <div className="page-head"><h2>Administración Kafka</h2>
      <button className="btn" disabled={busy} onClick={() => {topics.reload(); cluster.reload(); groups.reload();}}>Actualizar</button></div>
    <p>Consulta brokers, tópicos y progreso de consumidores. Los tópicos del sistema están protegidos contra eliminación.</p>
    {(error || topics.error || cluster.error || groups.error) && <p className="error" role="alert">{error || topics.error || cluster.error || groups.error}</p>}
    {notice && <p role="status">{notice}</p>}
    {cluster.data && <section className="card">
      <h3>Brokers disponibles: {cluster.data.brokers.length}</h3>
      <p>Controlador: {cluster.data.controllerId}</p>
      <ul>{cluster.data.brokers.map(b => <li key={b.id}>Broker {b.id}: {b.host}:{b.port}</li>)}</ul>
    </section>}
    <section className="card">
      <h3>Tópicos</h3>
      {topics.loading && !topics.data && <p>Cargando tópicos…</p>}
      <div className="table-wrap"><table><thead><tr><th>Tópico</th><th>Particiones</th><th>Réplicas</th><th>ISR por partición</th><th>Acciones</th></tr></thead>
        <tbody>{(topics.data || []).map(row => <tr key={row.name}><td>{row.name}</td><td>{row.partitions}</td><td>{row.replicationFactor}</td>
          <td>{row.inSyncReplicas.map(p => p.partition + ': ' + p.isr + '/' + p.replicas).join(', ')}</td>
          <td><button className="btn small" disabled={busy} onClick={() => inspect(row)}>Configuración</button>
            <button className="btn small" disabled={busy || row.protected} onClick={() => {
              if (window.confirm('Eliminar ' + row.name + ' y sus mensajes retenidos?'))
                action(() => request('/api/kafka/topics/' + encodeURIComponent(row.name), {method: 'DELETE'}), 'Tópico eliminado.');
            }}>Eliminar</button></td></tr>)}</tbody></table></div>
    </section>
    {topic && config && <section className="card">
      <h3>Configuración: {topic.name}</h3>
      <p>Retención actual: {config['retention.ms']} ms. Mínimo de réplicas en sincronía: {config['min.insync.replicas']}.</p>
      <form onSubmit={event => {event.preventDefault(); action(() => request('/api/kafka/topics/' + encodeURIComponent(topic.name) + '/config',
        {method: 'PUT', body: {partitions: Number(change.partitions), retentionMs: Math.round(Number(change.days) * 86400000), cleanupPolicy: change.cleanupPolicy}}), 'Configuración actualizada. Vuelve a consultar el tópico para verificarla.');}}>
        <div className="row"><label>Particiones<input type="number" min={topic.partitions} max={48} required disabled={topic.protected} value={change.partitions} onChange={e => setChange({...change, partitions: e.target.value})}/></label>
          <label>Retención en días<input type="number" min={topic.name === 'audit.timeline' ? 14 : topic.protected ? 7 : 1} max={90} required value={change.days} onChange={e => setChange({...change, days: e.target.value})}/></label>
          <label>Limpieza<select disabled={topic.protected} value={change.cleanupPolicy} onChange={e => setChange({...change, cleanupPolicy: e.target.value})}><option value="delete">Por retención</option><option value="compact">Compactar por clave</option><option value="compact,delete">Compactar y aplicar retención</option></select></label></div>
        <button className="btn primary" disabled={busy}>Guardar configuración</button>
      </form>
    </section>}
    <section className="card"><h3>Crear tópico de prueba</h3>
      <form onSubmit={event => {event.preventDefault(); action(() => request('/api/kafka/topics', {method: 'POST', body: {
        name: create.name, partitions: Number(create.partitions), replicationFactor: Number(create.replicationFactor),
        retentionMs: Number(create.days) * 86400000, cleanupPolicy: create.cleanupPolicy}}), 'Tópico creado.');}}>
        <div className="row"><label>Nombre<input name="name" required maxLength={96} value={create.name} onChange={updateCreate}/></label>
          <label>Particiones<input name="partitions" type="number" min={1} max={48} required value={create.partitions} onChange={updateCreate}/></label>
          <label>Réplicas<input name="replicationFactor" type="number" min={1} max={3} required value={create.replicationFactor} onChange={updateCreate}/></label>
          <label>Retención en días<input name="days" type="number" min={1} max={90} required value={create.days} onChange={updateCreate}/></label>
          <label>Limpieza<select name="cleanupPolicy" value={create.cleanupPolicy} onChange={updateCreate}><option value="delete">Por retención</option><option value="compact">Compactar por clave</option><option value="compact,delete">Ambas</option></select></label></div>
        <button className="btn primary" disabled={busy}>Crear tópico</button>
      </form>
    </section>
    <section className="card"><h3>Grupos de consumidores</h3>
      <div className="actions">{(groups.data || []).map(id => <button key={id} className="btn" disabled={busy} onClick={() => inspectGroup(id)}>{id}</button>)}</div>
      {group && <><h4>{group.groupId} · {group.state} · {group.members} miembros</h4>
        <div className="table-wrap"><table><thead><tr><th>Tópico</th><th>Partición</th><th>Offset confirmado</th><th>Final del log</th><th>Lag</th></tr></thead>
          <tbody>{group.positions.map(p => <tr key={p.topic + ':' + p.partition}><td>{p.topic}</td><td>{p.partition}</td><td>{p.offset}</td><td>{p.endOffset}</td><td>{p.lag}</td></tr>)}</tbody></table></div>
        <button className="btn" disabled={busy} onClick={() => inspectGroup(group.groupId)}>Actualizar grupo</button>
        <details><summary>Modificar posición de un grupo detenido</summary>
          <p>Requiere detener todos sus consumidores. Un offset anterior reprocesa datos; uno posterior omite eventos.</p>
          <form onSubmit={event => {event.preventDefault(); if (window.confirm('Cambiar la posición de ' + group.groupId + '?'))
            action(() => request('/api/kafka/groups/' + encodeURIComponent(group.groupId) + '/offsets', {method: 'POST',
              body: {topic: offset.topic, partition: Number(offset.partition), offset: Number(offset.offset)}}), 'Offset actualizado. Consulta el grupo para comprobarlo.');}}>
            <div className="row"><label>Tópico<input required value={offset.topic} onChange={e => setOffset({...offset, topic: e.target.value})}/></label>
              <label>Partición<input type="number" min={0} required value={offset.partition} onChange={e => setOffset({...offset, partition: e.target.value})}/></label>
              <label>Offset<input type="number" min={0} required value={offset.offset} onChange={e => setOffset({...offset, offset: e.target.value})}/></label></div>
            <button className="btn" disabled={busy || group.members !== 0}>Cambiar offset</button>
          </form></details>
      </>}
    </section>
  </div>;
}

