import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
  TablePagination,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { funcionarioService, authService } from '../services';

const FuncionarioManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    matricula: '',
    cargo: '',
    salario: '',
    dataAdmissao: '',
    dataNascimento: '',
    celular: '',
    telefone: '',
    endereco: '',
    complemento: '',
    bairro: '',
    numero: '',
    cidade: '',
    uf: '',
    cep: '',
    status: 'ativo', // ativo, inativo, licenca, ferias
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Função para buscar dados do CEP
  const fetchCepData = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf
        }));

        setFormErrors(prev => {
          const newErrors = { ...prev };
          if (data.logradouro && newErrors.endereco) delete newErrors.endereco;
          if (data.bairro && newErrors.bairro) delete newErrors.bairro;
          if (data.localidade && newErrors.cidade) delete newErrors.cidade;
          if (data.uf && newErrors.uf) delete newErrors.uf;
          return newErrors;
        });

        setMessage({ type: 'success', text: 'Endereço carregado automaticamente!' });
      } else {
        setMessage({ type: 'warning', text: 'CEP não encontrado.' });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setMessage({ type: 'error', text: 'Erro ao buscar dados do CEP.' });
    } finally {
      setCepLoading(false);
    }
  };

  // Função para limpar erro de um campo específico
  const clearFieldError = (fieldName) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const user = authService.getUserData();
    setCurrentUser(user);
    loadFuncionarios();
  }, []);

  // Funções utilitárias (devem ser declaradas antes dos hooks que as utilizam)
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'licenca':
        return 'Licença';
      case 'ferias':
        return 'Férias';
      default:
        return 'Não definido';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'success';
      case 'inativo':
        return 'error';
      case 'licenca':
        return 'warning';
      case 'ferias':
        return 'info';
      default:
        return 'default';
    }
  };

  const loadFuncionarios = async () => {
    setLoading(true);
    try {
      const result = await funcionarioService.getAllFuncionarios(1, 1000);
      console.log('🔍 Resultado da API getAllFuncionarios:', result);

      if (result.success) {
        const funcionariosData = result.data?.data || result.data || [];
        console.log('👥 Funcionários recebidos:', funcionariosData, 'É array?', Array.isArray(funcionariosData));
        setFuncionarios(funcionariosData);
      } else {
        console.error('❌ Erro na API:', result.message);
        setMessage({ type: 'error', text: result.message });
        setFuncionarios([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar funcionários' });
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar funcionários baseado no termo de busca
  const filteredFuncionarios = useMemo(() => {
    if (!Array.isArray(funcionarios)) return [];

    if (!searchTerm.trim()) {
      return funcionarios;
    }

    return funcionarios.filter(funcionario =>
      (funcionario.nome && funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.email && funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.cpf && funcionario.cpf.includes(searchTerm)) ||
      (funcionario.matricula && funcionario.matricula.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (funcionario.cargo && funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getStatusLabel(funcionario.status).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [funcionarios, searchTerm]);

  // Paginação dos funcionários filtrados
  const paginatedFuncionarios = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredFuncionarios.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredFuncionarios, page, rowsPerPage]);

  // Manipuladores da paginação
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Resetar página quando pesquisar
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenDialog = (mode, funcionario = null) => {
    setDialogMode(mode);
    setSelectedFuncionario(funcionario);

    if (funcionario) {
      setFormData({
        nome: funcionario.nome || '',
        email: funcionario.email || '',
        cpf: funcionario.cpf || '',
        matricula: funcionario.matricula || '',
        cargo: funcionario.cargo || '',
        salario: funcionario.salario || '',
        dataAdmissao: funcionario.dataAdmissao || '',
        dataNascimento: funcionario.dataNascimento || '',
        celular: funcionario.celular || '',
        telefone: funcionario.telefone || '',
        endereco: funcionario.endereco || '',
        complemento: funcionario.complemento || '',
        bairro: funcionario.bairro || '',
        numero: funcionario.numero || '',
        cidade: funcionario.cidade || '',
        uf: funcionario.uf || '',
        cep: funcionario.cep || '',
        status: funcionario.status || 'ativo',
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        matricula: '',
        cargo: '',
        salario: '',
        dataAdmissao: '',
        dataNascimento: '',
        celular: '',
        telefone: '',
        endereco: '',
        complemento: '',
        bairro: '',
        numero: '',
        cidade: '',
        uf: '',
        cep: '',
        status: 'ativo',
      });
    }

    setFormErrors({});
    setMessage({ type: '', text: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFuncionario(null);
    setFormData({
      nome: '',
      email: '',
      cpf: '',
      matricula: '',
      cargo: '',
      salario: '',
      dataAdmissao: '',
      dataNascimento: '',
      celular: '',
      telefone: '',
      endereco: '',
      complemento: '',
      bairro: '',
      numero: '',
      cidade: '',
      uf: '',
      cep: '',
      status: 'ativo',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    // Campos obrigatórios conforme a API
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.cpf.trim()) {
      errors.cpf = 'CPF é obrigatório';
    }

    if (!formData.matricula.trim()) {
      errors.matricula = 'Matrícula é obrigatória';
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormLoading(true);
    try {
      let result;

      // Preparar dados para a API
      const apiData = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ''),
        matricula: formData.matricula.trim(),
        cargo: formData.cargo.trim(),
        salario: formData.salario ? parseFloat(formData.salario) : null,
        dataAdmissao: formData.dataAdmissao,
        dataNascimento: formData.dataNascimento,
        celular: formData.celular.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        endereco: formData.endereco.trim(),
        complemento: formData.complemento.trim(),
        bairro: formData.bairro.trim(),
        numero: formData.numero.trim(),
        cidade: formData.cidade.trim(),
        uf: formData.uf.trim().toUpperCase(),
        cep: formData.cep.replace(/\D/g, ''),
        status: formData.status,
      };

      if (dialogMode === 'create') {
        result = await funcionarioService.createFuncionario(apiData);
      } else if (dialogMode === 'edit') {
        result = await funcionarioService.updateFuncionario(selectedFuncionario.id, apiData);
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        handleCloseDialog();
        loadFuncionarios();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro inesperado' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (funcionario) => {
    if (window.confirm(`Tem certeza que deseja inativar o funcionário ${funcionario.nome}?`)) {
      try {
        const result = await funcionarioService.inativarFuncionario(funcionario.id);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          loadFuncionarios();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao inativar funcionário' });
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Gerenciamento de Funcionários
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {loading ? 'Carregando...' :
              searchTerm ?
                `${filteredFuncionarios.length} funcionários encontrados de ${funcionarios.length} total` :
                `${funcionarios.length} funcionários cadastrados`
            }
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadFuncionarios}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Novo Funcionário
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Pesquisar funcionários"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Digite nome, email, CPF, matrícula, cargo ou status..."
          />
        </CardContent>
      </Card>

      {/* Funcionarios Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Funcionário</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Matrícula</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFuncionarios.map((funcionario) => (
                    <TableRow key={funcionario.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {funcionario.nome?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {funcionario.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {funcionario.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{funcionario.email}</TableCell>
                      <TableCell>{funcionario.matricula}</TableCell>
                      <TableCell>{funcionario.cargo}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(funcionario.status)}
                          color={getStatusColor(funcionario.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Visualizar">
                            <IconButton
                              color="info"
                              onClick={() => handleOpenDialog('view', funcionario)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog('edit', funcionario)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Inativar">
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(funcionario)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredFuncionarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          Nenhum funcionário encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Paginação */}
          {!loading && filteredFuncionarios.length > 0 && (
            <TablePagination
              component="div"
              count={filteredFuncionarios.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                px: 2
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Funcionario Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            borderRadius: 3,
            margin: { xs: 2, sm: 3 },
            maxHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 100px)' },
            position: 'relative',
            top: { xs: 32, sm: 50 },
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: { xs: 'flex-start', sm: 'center' },
            paddingTop: { xs: 2, sm: 0 },
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pb: 2,
          mb: 1,
        }}>
          {dialogMode === 'create' && 'Novo Funcionário'}
          {dialogMode === 'edit' && 'Editar Funcionário'}
          {dialogMode === 'view' && 'Visualizar Funcionário'}
        </DialogTitle>

        <DialogContent sx={{
          pt: { xs: 2, sm: 3 },
          pb: 2,
          px: { xs: 1, sm: 2 },
          mt: 1,
          maxHeight: { xs: '70vh', sm: '80vh' },
          overflowY: 'auto',
        }}>
          {/* Dados Pessoais */}
          <Grid container xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Dados Pessoais
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid style={{ width: '30%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Nome Completo *"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value });
                  clearFieldError('nome');
                }}
                error={!!formErrors.nome}
                helperText={formErrors.nome}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '25%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearFieldError('email');
                }}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '20%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="CPF *"
                value={formData.cpf}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                  setFormData({ ...formData, cpf: value });
                  clearFieldError('cpf');
                }}
                error={!!formErrors.cpf}
                helperText={formErrors.cpf}
                disabled={dialogMode === 'view' || formLoading}
                inputProps={{ maxLength: 14 }}
              />
            </Grid>

            <Grid style={{ width: '20%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => {
                  setFormData({ ...formData, dataNascimento: e.target.value });
                  clearFieldError('dataNascimento');
                }}
                error={!!formErrors.dataNascimento}
                helperText={formErrors.dataNascimento}
                disabled={dialogMode === 'view' || formLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Dados Profissionais */}
          <Grid container xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
              <BadgeIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Dados Profissionais
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid style={{ width: '25%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Matrícula *"
                value={formData.matricula}
                onChange={(e) => {
                  setFormData({ ...formData, matricula: e.target.value });
                  clearFieldError('matricula');
                }}
                error={!!formErrors.matricula}
                helperText={formErrors.matricula}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '25%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={formData.cargo}
                onChange={(e) => {
                  setFormData({ ...formData, cargo: e.target.value });
                  clearFieldError('cargo');
                }}
                error={!!formErrors.cargo}
                helperText={formErrors.cargo}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '25%' }} item xs={12} xl={6} md={6} lg={6}>
              <FormControl fullWidth error={!!formErrors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => {
                    setFormData({ ...formData, status: e.target.value });
                    clearFieldError('status');
                  }}
                  disabled={dialogMode === 'view' || formLoading}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                  <MenuItem value="licenca">Licença</MenuItem>
                  <MenuItem value="ferias">Férias</MenuItem>
                </Select>
                {formErrors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid style={{ width: '20%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Salário"
                type="number"
                value={formData.salario}
                onChange={(e) => {
                  setFormData({ ...formData, salario: e.target.value });
                  clearFieldError('salario');
                }}
                error={!!formErrors.salario}
                helperText={formErrors.salario}
                disabled={dialogMode === 'view' || formLoading}
                InputProps={{ startAdornment: <span>R$ </span> }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Data de Admissão"
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => {
                  setFormData({ ...formData, dataAdmissao: e.target.value });
                }}
                disabled={dialogMode === 'view' || formLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Endereço */}
          <Grid container xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
              <HomeIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Endereço
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid style={{ width: '20%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="CEP"
                value={formData.cep}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                  setFormData({ ...formData, cep: value });
                  clearFieldError('cep');
                }}
                onBlur={(e) => {
                  const cep = e.target.value;
                  if (cep && cep.length >= 8) {
                    fetchCepData(cep);
                  }
                }}
                error={!!formErrors.cep}
                helperText={formErrors.cep}
                disabled={dialogMode === 'view' || formLoading}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  endAdornment: cepLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }}
              />
            </Grid>

            <Grid style={{ width: '30%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Endereço"
                value={formData.endereco}
                onChange={(e) => {
                  setFormData({ ...formData, endereco: e.target.value });
                  clearFieldError('endereco');
                }}
                error={!!formErrors.endereco}
                helperText={formErrors.endereco}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '20%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Número"
                value={formData.numero}
                onChange={(e) => {
                  setFormData({ ...formData, numero: e.target.value });
                  clearFieldError('numero');
                }}
                error={!!formErrors.numero}
                helperText={formErrors.numero}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '25%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Complemento"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid style={{ width: '33%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Bairro"
                value={formData.bairro}
                onChange={(e) => {
                  setFormData({ ...formData, bairro: e.target.value });
                  clearFieldError('bairro');
                }}
                error={!!formErrors.bairro}
                helperText={formErrors.bairro}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.cidade}
                onChange={(e) => {
                  setFormData({ ...formData, cidade: e.target.value });
                  clearFieldError('cidade');
                }}
                error={!!formErrors.cidade}
                helperText={formErrors.cidade}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="UF"
                value={formData.uf}
                onChange={(e) => {
                  setFormData({ ...formData, uf: e.target.value.toUpperCase() });
                  clearFieldError('uf');
                }}
                error={!!formErrors.uf}
                helperText={formErrors.uf}
                disabled={dialogMode === 'view' || formLoading}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
          </Grid>

          {/* Contato */}
          <Grid container xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 2 }}>
              <PhoneIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                Contato
              </Typography>
            </Box>
          </Grid>
          <Grid container spacing={2}>
            <Grid style={{ width: '33%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Celular"
                value={formData.celular}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                  setFormData({ ...formData, celular: value });
                  clearFieldError('celular');
                }}
                error={!!formErrors.celular}
                helperText={formErrors.celular}
                disabled={dialogMode === 'view' || formLoading}
                inputProps={{ maxLength: 15 }}
              />
            </Grid>

            <Grid style={{ width: '33%' }} item xs={12} xl={6} md={6} lg={6}>
              <TextField
                fullWidth
                label="Telefone Fixo"
                value={formData.telefone}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                  setFormData({ ...formData, telefone: value });
                }}
                disabled={dialogMode === 'view' || formLoading}
                inputProps={{ maxLength: 14 }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          px: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
        }}>
          <Button
            onClick={handleCloseDialog}
            disabled={formLoading}
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
          >
            {dialogMode === 'view' ? 'Fechar' : 'Cancelar'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={formLoading}
              fullWidth={isMobile}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                minWidth: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 }
              }}
            >
              {formLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                dialogMode === 'create' ? 'Criar' : 'Salvar'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FuncionarioManagement;